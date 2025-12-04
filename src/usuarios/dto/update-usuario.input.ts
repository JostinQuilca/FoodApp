import { CreateUsuarioInput } from './create-usuario.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUsuarioInput extends PartialType(CreateUsuarioInput) {
  @Field(() => String)
  cedula: string;
}
