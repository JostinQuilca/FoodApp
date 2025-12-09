import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaResolver } from './auditoria.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    AuditoriaService,
    AuditoriaResolver,
    PrismaService
  ],
  exports: [
    AuditoriaService   
  ]
})

export class AuditoriaModule {}
