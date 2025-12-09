import { ObjectType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json'; // <--- 1. IMPORTAR ESTO

@ObjectType()
export class Auditoria {
  @Field(() => Int) // Mejor usar Int si el ID es numérico
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

  // 2. CAMBIAR 'String' POR 'GraphQLJSON'
  @Field(() => GraphQLJSON, { nullable: true })
  datosAnteriores?: any;

  // 3. CAMBIAR 'String' POR 'GraphQLJSON' AQUÍ TAMBIÉN
  @Field(() => GraphQLJSON, { nullable: true })
  datosNuevos?: any;
}
