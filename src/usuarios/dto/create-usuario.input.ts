import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateUsuarioInput {
  @Field()
  nombre: string;

  @Field({ nullable: true })
  apellido?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field()
  email: string;

  @Field()
  password: string; // Campo que se encripta en el servicio

  @Field()
  direccionPrincipal: string;

  @Field(() => Int)
  rolId: number; // 1 (Cliente) o 2 (Administrador)
}
