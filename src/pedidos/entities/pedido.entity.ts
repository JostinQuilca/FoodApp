import { ObjectType, Field, Int, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { DetallePedido } from 'src/detalles_pedido/entities/detalles_pedido.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@ObjectType()
export class Pedido {
  @Field(() => Int)
  id: number;

  @Field()
  usuarioCedula: string;

  @Field(() => GraphQLISODateTime)
  fechaPedido: Date;

  @Field()
  estadoPedido: string;

  @Field()
  tipoEntrega: string;  

  @Field()
  direccionEntrega: string;

  @Field(() => Float)
  montoTotal: number;

  @Field()
  estado: string;

  @Field(() => Usuario)
  usuario: Usuario;

  @Field(() => [DetallePedido])
  detalles: DetallePedido[];

}