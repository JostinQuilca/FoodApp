import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Factura } from './factura.entity';
import { Platillo } from '../../platillos/entities/platillo.entity';

@ObjectType()
export class DetalleFactura {
  @Field(() => Int)
  id: number;

  @Field(() => Factura)
  factura: Factura;

  @Field(() => Platillo)
  platillo: Platillo;

  @Field(() => Int)
  cantidad: number;

  @Field(() => Float)
  precioUnitario: number;

  @Field(() => Float)
  subtotal: number;

  @Field({ nullable: true })
  descripcionItem?: string;

  @Field({ nullable: true })
  notas?: string;

  @Field()
  estado: string;
}
