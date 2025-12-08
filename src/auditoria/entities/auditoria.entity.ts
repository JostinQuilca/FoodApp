import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Usuario } from '../../usuarios/entities/usuario.entity';  // Importa si existe
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Auditoria {
  @Field(() => Int)
  id: number;

  @Field()
  usuarioCedula: string;

  @Field()
  fechaHora: Date;

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


  @Field(() => Usuario)
  usuario: Usuario;
}