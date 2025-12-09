import { InputType, Field, Float, Int } from '@nestjs/graphql';

// 1. Definimos el input para CADA item de la lista (el detalle)
@InputType()
class PedidoDetalleItemInput {
  @Field(() => Int)
  itemId: number;

  @Field(() => Int)
  cantidad: number;

  @Field(() => Float)
  precioUnitario: number;

  @Field(() => Float)
  subtotal: number;

  @Field({ nullable: true })
  notasAdicionales?: string;
}

// 2. Actualizamos el input principal del Pedido
@InputType()
export class CreatePedidoInput {
  @Field()
  usuarioCedula: string;

  @Field()
  tipoEntrega: string;

  @Field()
  direccionEntrega: string;

  @Field(() => Float)
  montoTotal: number;


  @Field({ nullable: true })
  estadoPedido?: string;


  @Field({ nullable: true })
  estado?: string;


  @Field(() => [PedidoDetalleItemInput]) 
  detalles: PedidoDetalleItemInput[];
}