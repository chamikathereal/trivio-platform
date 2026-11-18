import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthBoundaryGuard } from './auth-boundary.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthBoundaryGuard,
    },
  ],
  exports: [],
})
export class AuthBoundaryModule {}
