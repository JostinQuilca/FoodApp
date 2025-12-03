import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Cliente {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string; // <--- Faltaba esto

  @Field({ nullable: true })
  apellido?: string; // <--- Faltaba esto

  @Field({ nullable: true })
  telefono?: string;

  @Field()
  email: string;

  @Field()
  direccionPrincipal: string; // <--- Faltaba esto

  @Field()
  estado: string; // <--- Faltaba esto
}
