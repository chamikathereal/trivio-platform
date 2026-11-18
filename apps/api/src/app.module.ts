import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthBoundaryModule } from './auth-boundary/auth-boundary.module.js';
import { AuditModule } from './audit/audit.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';
import { MerchantsModule } from './merchants/merchants.module.js';
import { FeeAgreementsModule } from './fee-agreements/fee-agreements.module.js';
import { SettlementPoliciesModule } from './settlement-policies/settlement-policies.module.js';
import { CalendarsModule } from './calendars/calendars.module.js';
import { EstimatesModule } from './estimates/estimates.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthBoundaryModule,
    AuditModule,
    WorkspacesModule,
    MerchantsModule,
    FeeAgreementsModule,
    SettlementPoliciesModule,
    CalendarsModule,
    EstimatesModule,
    HealthModule,
  ],
})
export class AppModule {}
