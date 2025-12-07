import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreatePlatilloInput {
  @Field()
  categoriaNombre: string;

  @Field()
  nombreItem: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field()
  precio: number;

  @Field({ nullable: true })
  disponible?: boolean;

  @Field({ nullable: true })
  estado?: string;
}