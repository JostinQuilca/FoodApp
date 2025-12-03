import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateClienteInput {
  @Field()
  nombre: string;

  @Field({ nullable: true }) // Opcional
  apellido?: string;

  @Field({ nullable: true }) // Opcional
  telefono?: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  direccionPrincipal: string;
}
