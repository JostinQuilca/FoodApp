import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min, IsPositive } from 'class-validator';

@InputType()
export class CreateDetalleFacturaInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  cantidad: number;

  @Field(() => Float)
  @IsPositive()
  precioUnitario: number;
}
