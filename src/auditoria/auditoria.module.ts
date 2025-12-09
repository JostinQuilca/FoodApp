import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importa el módulo de Prisma para el servicio

@Module({
  imports: [PrismaModule], // Asegura que Prisma esté disponible para el AuditoriaService
  providers: [AuditoriaService],
  exports: [AuditoriaService], // Exporta el servicio para que otros módulos lo puedan usar
})
export class AuditoriaModule {}