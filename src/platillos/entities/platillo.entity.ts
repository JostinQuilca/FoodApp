import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Platillo {
  @Field(() => Int)
  id: number;

  @Field()
  categoriaNombre: string;

  @Field()
  nombreItem: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field()
  precio: number;  // Prisma maneja Decimal como number en TS

  @Field()
  disponible: boolean;

  @Field()
  estado: string;
}