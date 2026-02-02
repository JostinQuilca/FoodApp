import { Module } from '@nestjs/common';
import { DetallesPedidoService } from './detalles_pedido.service';
import { DetallesPedidoResolver } from './detalles_pedido.resolver';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';

@Module({
  providers: [DetallesPedidoService, DetallesPedidoResolver],
  imports:[AuditoriaModule]
})
export class DetallesPedidoModule {}
