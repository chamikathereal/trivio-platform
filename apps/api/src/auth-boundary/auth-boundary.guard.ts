import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, ROLES_KEY } from './decorators.js';

export interface AuthenticatedContextRequest {
  workspaceId: string;
  actorId: string;
  roles: string[];
  headers: Record<string, string | undefined>;
}

@Injectable()
export class AuthBoundaryGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedContextRequest>();
    const nodeEnv = process.env['NODE_ENV'] ?? 'development';

    // In production, real authentication is gated pending Stage 4C.2
    if (nodeEnv === 'production') {
      throw new ForbiddenException(
        'Public CRUD routes disabled. Production authentication integration is scheduled for Stage 4C.2.',
      );
    }

    // Gated test/dev identity evaluation
    const workspaceId = request.headers['x-test-workspace-id'];
    const actorId = request.headers['x-test-actor-id'];
    const rolesHeader = request.headers['x-test-roles'];

    if (!workspaceId || !actorId) {
      throw new UnauthorizedException(
        'Missing workspace or actor authorization context. Access denied by default.',
      );
    }

    const roles = rolesHeader ? rolesHeader.split(',').map(r => r.trim().toUpperCase()) : ['MEMBER'];

    request.workspaceId = workspaceId;
    request.actorId = actorId;
    request.roles = roles;

    // Check role requirements if specified
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => roles.includes(role.toUpperCase()));
      if (!hasRole) {
        throw new ForbiddenException(
          `Insufficient workspace permissions. Required one of: ${requiredRoles.join(', ')}`,
        );
      }
    }

    return true;
  }
}
