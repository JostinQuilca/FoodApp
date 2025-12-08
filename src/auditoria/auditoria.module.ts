import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaResolver } from './auditoria.resolver';

@Module({
  providers: [AuditoriaService, AuditoriaResolver]
})
export class AuditoriaModule {}
