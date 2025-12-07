import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { pedidosResolver } from './pedidos.resolver';

@Module({
  providers: [PedidosService, pedidosResolver]
})
export class PedidosModule {}
