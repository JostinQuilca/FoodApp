
import { Module, forwardRef } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { pedidosResolver } from './pedidos.resolver';
import { FacturacionModule } from '../facturacion/facturacion.module';

@Module({
  imports: [forwardRef(() => FacturacionModule)],
  providers: [PedidosService, pedidosResolver],
})
export class PedidosModule {}
