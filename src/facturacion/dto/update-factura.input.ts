import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class UpdateFacturaInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  estadoFactura?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
