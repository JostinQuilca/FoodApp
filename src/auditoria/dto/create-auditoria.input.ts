import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateAuditoriaInput {
  @Field()
  usuarioCedula: string;

  @Field()
  tipoAccion: string;

  @Field()
  nombreTabla: string;

  @Field()
  registroId: string;

@Field(() => GraphQLJSON, { nullable: true })
  datosAnteriores?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  datosNuevos?: any;

}