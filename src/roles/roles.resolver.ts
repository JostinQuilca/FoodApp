import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Rol } from './entities/rol.entity';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';

@Resolver(() => Rol)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Mutation(() => Rol)
  createRol(@Args('createRolInput') createRolInput: CreateRolInput) {
    return this.rolesService.create(createRolInput);
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
  updateRol(@Args('updateRolInput') updateRolInput: UpdateRolInput) {
    return this.rolesService.update(updateRolInput.id, updateRolInput);
  }

  @Mutation(() => Rol)
  removeRol(@Args('id', { type: () => Int }) id: number) {
    return this.rolesService.remove(id);
  }
}