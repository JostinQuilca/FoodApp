import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, IsOptional, Min, Max } from 'class-validator';
import { CreateDetalleFacturaInput } from './create-detalle-factura.input';

@InputType()
export class CreateFacturaInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  usuarioCedula: string;

  @Field(() => [CreateDetalleFacturaInput])
  @IsArray()
  @IsNotEmpty()
  detalles: CreateDetalleFacturaInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  montoIva?: number;
}
