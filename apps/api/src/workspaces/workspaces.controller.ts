import { Controller, Get, Post, Body, Param, ForbiddenException } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { CurrentActor, CurrentWorkspace } from '../auth-boundary/decorators.js';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async createWorkspace(
    @CurrentActor() actorId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(actorId, dto);
  }

  @Get()
  async listWorkspaces(@CurrentActor() actorId: string) {
    return this.workspacesService.listWorkspacesForActor(actorId);
  }

  @Get(':id')
  async getWorkspace(
    @Param('id') id: string,
    @CurrentWorkspace() currentWorkspaceId: string,
  ) {
    // Tenant isolation: caller can only inspect their active workspace
    if (id !== currentWorkspaceId) {
      throw new ForbiddenException('Access denied: Cannot access workspaces outside authorized tenant context.');
    }
    return this.workspacesService.findById(id);
  }
}
