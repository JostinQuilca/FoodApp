import { Module } from '@nestjs/common';
import { DetallesPedidoService } from './detalles_pedido.service';
import { DetallesPedidoResolver } from './detalles_pedido.resolver';

@Module({
  providers: [DetallesPedidoService, DetallesPedidoResolver]
})
export class DetallesPedidoModule {}
