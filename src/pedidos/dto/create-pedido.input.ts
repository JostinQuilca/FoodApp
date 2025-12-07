import { InputType, Field, Float } from '@nestjs/graphql';
import { DetallePedido } from 'src/detalles_pedido/entities/detalles_pedido.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

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

  // Opcional: puedes permitir setear estadoPedido en la creación
  @Field({ nullable: true })
  estadoPedido?: string;

  // Opcional: estado general del registro
  @Field({ nullable: true })
  estado?: string;


}