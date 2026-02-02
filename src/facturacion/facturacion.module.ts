
import { Module } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { FacturacionResolver } from './facturacion.resolver';
import { FacturacionController } from './facturacion.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [FacturacionController],
  providers: [FacturacionService, FacturacionResolver],
  exports: [FacturacionService], // Exportar para que otros módulos lo usen
})
export class FacturacionModule {}
