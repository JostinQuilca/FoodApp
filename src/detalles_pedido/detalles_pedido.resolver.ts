import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DetallesPedidoService } from './detalles_pedido.service';
import { DetallePedido } from './entities/detalles_pedido.entity';
import { CreateDetallePedidoInput } from './dto/create-detalles_pedido.input';
import { UpdateDetallePedidoInput } from './dto/update-detalles_pedido.input';

@Resolver(() => DetallePedido)
export class DetallesPedidoResolver {
  constructor(private readonly detallesPedidoService: DetallesPedidoService) {}

  @Mutation(() => DetallePedido)
  createDetallePedido(
    @Args('createDetallePedidoInput') createDetallePedidoInput: CreateDetallePedidoInput,
  ) {
    return this.detallesPedidoService.create(createDetallePedidoInput);
  }

  @Query(() => [DetallePedido], { name: 'detallesPedido' })
  findAll() {
    return this.detallesPedidoService.findAll();
  }

  @Query(() => DetallePedido, { name: 'detallePedido' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.detallesPedidoService.findOne(id);
  }

  @Mutation(() => DetallePedido)
  updateDetallePedido(
    @Args('updateDetallePedidoInput') updateDetallePedidoInput: UpdateDetallePedidoInput,
  ) {
    return this.detallesPedidoService.update(updateDetallePedidoInput.id, updateDetallePedidoInput);
  }

  @Mutation(() => DetallePedido)
  removeDetallePedido(@Args('id', { type: () => Int }) id: number) {
    return this.detallesPedidoService.remove(id);
  }
}