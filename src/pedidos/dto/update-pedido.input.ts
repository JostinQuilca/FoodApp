import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import { CreatePedidoInput } from './create-pedido.input';

@InputType()
export class UpdatePedidoInput extends PartialType(CreatePedidoInput) {
  @Field(() => Int)
  id: number;

  // Si quieres permitir actualizar fechaPedido manualmente
  @Field({ nullable: true })
  fechaPedido?: Date;
}