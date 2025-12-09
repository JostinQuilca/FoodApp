import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';

@Resolver(() => Usuario)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  // MUTATION REGISTER: Llama al servicio para crear y hashear
  @Mutation(() => Usuario, { name: 'register' })
  register(@Args('createUsuarioInput') createUsuarioInput: CreateUsuarioInput) {
    return this.usuariosService.create(createUsuarioInput);
  }
    @Query(() => [Usuario], { name: 'usuariosPorRol' })
  findByRol(@Args('rolId', { type: () => Int }) rolId: number) {
    return this.usuariosService.findByRolId(rolId);
  }
@Mutation(() => Usuario, { name: 'cambiarEstadoUsuario' })
  cambiarEstadoUsuario(
    @Args('cedula') cedula: string,
    @Args('nuevoEstado') nuevoEstado: string,
  ) {
    return this.usuariosService.updateEstado(cedula, nuevoEstado);
  }

  // QUERY: Permite a los administradores ver la lista de usuarios
  @Query(() => [Usuario], { name: 'usuarios' })
  findAll() {
    return this.usuariosService.findAll();
  }
}
