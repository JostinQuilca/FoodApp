import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@ObjectType()
export class Rol {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string;

  @Field()
  estado: string;

  @Field(() => [Usuario], { nullable: true })
  usuarios?: Usuario[];
}