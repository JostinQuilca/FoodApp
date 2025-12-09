import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoInput } from './dto/create-pedido.input';
import { UpdatePedidoInput } from './dto/update-pedido.input';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePedidoInput) {
    // Extraemos los detalles del objeto principal
    const { detalles, ...pedidoData } = data;

    return this.prisma.pedido.create({
      data: {
        // Mapeamos los campos del Pedido (Maestro)
        usuarioCedula: pedidoData.usuarioCedula,
        tipoEntrega: pedidoData.tipoEntrega,
        direccionEntrega: pedidoData.direccionEntrega,
        montoTotal: pedidoData.montoTotal,
        estadoPedido: pedidoData.estadoPedido ?? 'Pendiente',
        estado: pedidoData.estado ?? 'ACTIVO',

        // Mapeamos los Detalles (Detalle) usando 'create' anidado
        detalles: {
          create: detalles.map((detalle) => ({
            itemId: detalle.itemId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.subtotal,
            notasAdicionales: detalle.notasAdicionales,
            estado: 'ACTIVO'
          })),
        },
      },
      include: { 
        usuario: true, 
        detalles: {
          include: {
            platillo: true // Para ver el nombre del platillo en la respuesta
          }
        } 
      },
    });
  }

  // ... resto de métodos (findAll, findOne, update, remove) se mantienen igual
  async findAll() {
    return this.prisma.pedido.findMany({
      include: {
        usuario: true,
        detalles: {
          include: {
            platillo: true,
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