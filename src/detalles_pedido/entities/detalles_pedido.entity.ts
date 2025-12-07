import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Pedido } from 'src/pedidos/entities/pedido.entity';
import { Platillo } from 'src/platillos/entities/platillo.entity';

@ObjectType()
export class DetallePedido {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  pedidoId: number;

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

  @Field()
  estado: string;

  // Relaciones
  @Field(() => Pedido)
  pedido: Pedido;

  @Field(() => Platillo)
  platillo: Platillo;
}