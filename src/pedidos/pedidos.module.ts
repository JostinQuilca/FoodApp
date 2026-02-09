
import { Module, forwardRef } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { pedidosResolver } from './pedidos.resolver';
import { PedidosController } from './pedidos.controller';
import { FacturacionModule } from '../facturacion/facturacion.module';
import { AuditoriaModule } from '@/auditoria/auditoria.module';

@Module({
  imports: [forwardRef(() => FacturacionModule), AuditoriaModule],
  controllers: [PedidosController],
  providers: [PedidosService, pedidosResolver],
})
export class PedidosModule {}
