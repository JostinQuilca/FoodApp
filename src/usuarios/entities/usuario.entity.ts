import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Rol {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string;
}

@ObjectType()
export class Usuario {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string;

  @Field()
  email: string;

  @Field()
  direccionPrincipal: string;

  @Field({ nullable: true })
  apellido?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field()
  estado: string; // ACTIVO / INACTIVO

  @Field(() => Rol)
  rol: Rol; // Objeto de Rol (ADMINISTRADOR o CLIENTE)
}
