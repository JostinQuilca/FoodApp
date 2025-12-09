import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Auditoria {
  @Field()
  id: number;

  @Field()
  usuarioCedula: string;

  @Field()
  tipoAccion: string;

  @Field()
  nombreTabla: string;

  @Field()
  registroId: string;

  @Field()
  fechaHora: Date;

  @Field(() => String, { nullable: true })
  datosAnteriores?: any;

  @Field(() => String, { nullable: true })
  datosNuevos?: any;
}
