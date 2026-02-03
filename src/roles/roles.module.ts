import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { AuditoriaModule } from '@/auditoria/auditoria.module';

@Module({
  providers: [RolesService, RolesResolver],
  imports: [AuditoriaModule]
})
export class RolesModule {}
