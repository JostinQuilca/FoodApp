import { CreatePlatilloInput } from './create-platillo.input';
import { InputType, Field, PartialType, Int } from '@nestjs/graphql';

@InputType()
export class UpdatePlatilloInput extends PartialType(CreatePlatilloInput) {
  @Field(() => Int)
  id: number;
}
