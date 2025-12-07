import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import { CreateDetallePedidoInput } from './create-detalles_pedido.input';

@InputType()
export class UpdateDetallePedidoInput extends PartialType(CreateDetallePedidoInput) {
  @Field(() => Int)
  id: number;
}