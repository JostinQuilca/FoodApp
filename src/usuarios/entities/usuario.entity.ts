import { ObjectType, Field } from '@nestjs/graphql';
import { Rol } from 'src/roles/entities/rol.entity';

@ObjectType()
export class Usuario {
  @Field()
  cedula: string;

  @Field()
  nombre: string;

  @Field()
  email: string;

  @Field()
  direccionPrincipal: string;

  @Field({ nullable: true })
  apellido?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field()
  estado: string;

  @Field(() => Rol)
  rol: Rol;
}