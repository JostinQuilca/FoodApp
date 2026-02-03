import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Rol } from './entities/rol.entity';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';  // Asume que existe
import { UseGuards } from '@nestjs/common';  // Para auth

@Resolver(() => Rol)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) { }

  @Mutation(() => Rol)
  @UseGuards(JwtAuthGuard)
  createRol(@Args('createRolInput') createRolInput: CreateRolInput, @Context() context: any) {
    const usuarioCedula = context.req.user.cedula;
    return this.rolesService.create(createRolInput, usuarioCedula);
  }

  @Query(() => [Rol], { name: 'roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Query(() => Rol, { name: 'rol' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.rolesService.findOne(id);
  }

  @Mutation(() => Rol)
  @UseGuards(JwtAuthGuard)
  updateRol(@Args('updateRolInput') updateRolInput: UpdateRolInput, @Context() context: any) {
    const usuarioCedula = context.req.user.cedula;
    return this.rolesService.update(updateRolInput.id, usuarioCedula, updateRolInput);
  }

  @Mutation(() => Rol)
  @UseGuards(JwtAuthGuard)
  removeRol(@Args('id', { type: () => Int }) id: number) {
    return this.rolesService.remove(id);
  }
}