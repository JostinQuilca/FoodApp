
import { Module, forwardRef } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { pedidosResolver } from './pedidos.resolver';
import { FacturacionModule } from '../facturacion/facturacion.module';
import { AuditoriaModule } from '@/auditoria/auditoria.module';

@Module({
  imports: [forwardRef(() => FacturacionModule),AuditoriaModule],
  providers: [PedidosService, pedidosResolver]})

export class PedidosModule {}
