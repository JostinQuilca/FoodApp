import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { pedidosResolver } from './pedidos.resolver';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';

@Module({
  providers: [PedidosService, pedidosResolver],
  imports:[AuditoriaModule]
})
export class PedidosModule {}
