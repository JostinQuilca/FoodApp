import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { DetalleFactura } from './detalle-factura.entity';

@ObjectType()
export class Factura {
  @Field(() => Int)
  id: number;

  @Field()
  numeroFactura: string;

  @Field(() => Usuario)
  usuario: Usuario;

  @Field(() => Pedido, { nullable: true })
  pedido?: Pedido;

  @Field()
  fechaFactura: Date;

  @Field({ nullable: true })
  fechaVencimiento?: Date;

  @Field(() => Float)
  montoSubtotal: number;

  @Field(() => Float)
  montoIva: number;

  @Field(() => Float)
  montoTotal: number;

  @Field()
  estadoFactura: string; // EMITIDA, PAGADA, ANULADA

  @Field()
  tipoFactura: string; // VENTA, PEDIDO

  @Field({ nullable: true })
  descripcion?: string;

  @Field()
  estado: string;

  @Field(() => [DetalleFactura], { nullable: true })
  detalles?: DetalleFactura[];
}
