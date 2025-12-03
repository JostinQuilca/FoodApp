import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity'; // <--- Importamos Cliente
import { CreateClienteInput } from './dto/create-cliente.input';

@Resolver(() => Cliente) // <--- Usamos Cliente
export class ClientesResolver {
  constructor(private readonly clientesService: ClientesService) {}

  @Mutation(() => Cliente) // <--- Devuelve un Cliente
  createCliente(
    @Args('createClienteInput') createClienteInput: CreateClienteInput,
  ) {
    return this.clientesService.create(createClienteInput);
  }

  @Query(() => [Cliente], { name: 'clientes' })
  findAll() {
    return this.clientesService.findAll();
  }
}
