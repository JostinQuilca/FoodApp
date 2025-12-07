import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateDetallePedidoInput {
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

  @Field({ nullable: true })
  estado?: string;
}