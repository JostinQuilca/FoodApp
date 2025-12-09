import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoInput } from './dto/create-pedido.input';
import { UpdatePedidoInput } from './dto/update-pedido.input';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

 async create(data: CreatePedidoInput) {
  return this.prisma.pedido.create({
    data: {
      usuarioCedula: data.usuarioCedula,
      tipoEntrega: data.tipoEntrega,
      direccionEntrega: data.direccionEntrega,
      montoTotal: data.montoTotal,
      estadoPedido: data.estadoPedido ?? 'Pendiente',
      estado: data.estado ?? 'ACTIVO',
    },
    include: { usuario: true, detalles: true },
  });
}

  async findAll() {
  return this.prisma.pedido.findMany({
    include: {
      usuario: true,
      detalles: {
        include: {
          platillo: true,   // 👈 esto asegura que cada detalle traiga su platillo
        },
      },
    },
  });
}


  async findOne(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id },
      include: { usuario: true, detalles: true },
    });
  }

  async update(id: number, updatePedidoInput: UpdatePedidoInput) {
    return this.prisma.pedido.update({
      where: { id },
      data: {
        tipoEntrega: updatePedidoInput.tipoEntrega,
        direccionEntrega: updatePedidoInput.direccionEntrega,
        montoTotal: updatePedidoInput.montoTotal,
        estadoPedido: updatePedidoInput.estadoPedido,
        estado: updatePedidoInput.estado,
      },
      include: { usuario: true, detalles: true },
    });
  }

  async remove(id: number) {
    return this.prisma.pedido.delete({ where: { id } });
  }
}