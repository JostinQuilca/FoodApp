import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDetallePedidoInput } from './dto/create-detalles_pedido.input';
import { UpdateDetallePedidoInput } from './dto/update-detalles_pedido.input';
import { AuditoriaService } from 'src/auditoria/auditoria.service';

@Injectable()
export class DetallesPedidoService {
  constructor(private readonly prisma: PrismaService,
    private auditoriaService: AuditoriaService
  ) {}

 async create(data: CreateDetallePedidoInput,usuarioCedula:any) {
  const detalle= await this.prisma.detallePedido.create({
    data,
    include: { pedido: true, platillo: true }, // 👈 importante
  });
  try {
    await this.auditoriaService.logAction(
      usuarioCedula, 
      'INSERT', // Tipo de acción
      'detalles_pedido',       // Tabla afectada
      detalle.id.toString(),           // ID del registro (en este caso la cédula)
      null,  // Datos viejos (lo que buscamos en el paso 1)
      detalle // Datos nuevos (lo que devolvió el update)
    );
  } catch (error) {
    console.error('Error al auditar creación: ', error);
  }
  return detalle;
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

  async update(id: number,usuarioCedula:any, data: UpdateDetallePedidoInput) {
    const detalleAnterior= await this.prisma.detallePedido.findUnique({where:{id}});
    const detalleActualizado= await this.prisma.detallePedido.update({
      where: { id },
      data,
    });
    try {
    await this.auditoriaService.logAction(
      usuarioCedula, 
      'UPDATE', // Tipo de acción
      'detalles_pedido',       // Tabla afectada
      detalleActualizado.id.toString(),           // ID del registro (en este caso la cédula)
      detalleAnterior,  // Datos viejos (lo que buscamos en el paso 1)
      detalleActualizado // Datos nuevos (lo que devolvió el update)
    );
  } catch (error) {
    console.error('Error al auditar actualización: ', error);
  }
    return detalleActualizado;
  }

  async remove(id: number) {
    return this.prisma.detallePedido.delete({ where: { id } });
  }
}