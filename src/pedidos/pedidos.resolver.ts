import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PedidosService } from './pedidos.service';
import { Pedido } from './entities/pedido.entity';
import { CreatePedidoInput } from './dto/create-pedido.input';
import { UpdatePedidoInput } from './dto/update-pedido.input';
import { UseGuards } from '@nestjs/common';  // Para auth
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // Asume que existe

@Resolver(() => Pedido)
export class pedidosResolver {
  constructor(private readonly pedidosService: PedidosService) {}

  @Mutation(() => Pedido)
 // @UseGuards(JwtAuthGuard)  // Protege con auth
  createPedido(@Args('createPedidoInput') createPedidoInput: CreatePedidoInput) {
    return this.pedidosService.create(createPedidoInput);
  }

  @Query(() => [Pedido], { name: 'pedidos' })
  findAll() {
    return this.pedidosService.findAll();
  }

  @Query(() => Pedido, { name: 'pedido' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.pedidosService.findOne(id);
  }
  
  @Mutation(() => Pedido)
 // @UseGuards(JwtAuthGuard)
  updatePedido(
    @Args('updatePedidoInput') updatePedidoInput: UpdatePedidoInput,
  ) {
    return this.pedidosService.update(updatePedidoInput.id, updatePedidoInput);
  }

  @Mutation(() => Pedido)
 // @UseGuards(JwtAuthGuard)
  removePedido(@Args('id', { type: () => Int }) id: number) {
    return this.pedidosService.remove(id);
  }
}