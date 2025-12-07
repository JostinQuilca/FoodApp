import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRolInput {
  @Field()
  nombre: string;

  @Field({ nullable: true })
  estado?: string; // opcional, por defecto será "ACTIVO"
}