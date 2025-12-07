import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDetallePedidoInput } from './dto/create-detalles_pedido.input';
import { UpdateDetallePedidoInput } from './dto/update-detalles_pedido.input';

@Injectable()
export class DetallesPedidoService {
  constructor(private readonly prisma: PrismaService) {}

 async create(data: CreateDetallePedidoInput) {
  return this.prisma.detallePedido.create({
    data,
    include: { pedido: true, platillo: true }, // 👈 importante
  });
}

  async findAll() {
    return this.prisma.detallePedido.findMany({
      include: { pedido: true, platillo: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.detallePedido.findUnique({
      where: { id },
      include: { pedido: true, platillo: true },
    });
  }

  async update(id: number, data: UpdateDetallePedidoInput) {
    return this.prisma.detallePedido.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.detallePedido.delete({ where: { id } });
  }
}