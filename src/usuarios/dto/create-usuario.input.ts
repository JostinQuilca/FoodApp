import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateUsuarioInput {
  @Field()
  cedula: string; // Requerido para PK

  @Field()
  nombre: string;

  @Field()
  email: string;

  @Field()
  password: string; // Se encripta en el servicio

  @Field()
  direccionPrincipal: string;

  @Field({ nullable: true })
  apellido?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field(() => Int)
  rolId: number;
}
