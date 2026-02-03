import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePlatilloInput } from './dto/create-platillo.input';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'; // Necesario para el hash
import { Prisma } from '@prisma/client';
import { AuditoriaService } from 'src/auditoria/auditoria.service';
import { DetallePedido } from 'src/detalles_pedido/entities/detalles_pedido.entity';
@Injectable()
export class PlatillosService {
  constructor(private prisma: PrismaService,
    private auditoriaService: AuditoriaService
  ) { }

  async create(createPlatilloInput: Prisma.PlatilloCreateInput, usuarioCedula: any) {
    const platillo = await this.prisma.platillo.create({ data: createPlatilloInput, include: { detallesPedido: true } });
    try {
      await this.auditoriaService.logAction(
        usuarioCedula,
        'INSERT', // Tipo de acción
        'platillos',       // Tabla afectada
        platillo.id.toString(),           // ID del registro (en este caso la cédula)
        null,  // Datos viejos (lo que buscamos en el paso 1)
        platillo // Datos nuevos (lo que devolvió el update)
      );
    } catch (error) {
      console.error('Error al auditar creación: ', error);
    }
    return platillo;
  }

  async findAll() {
    return this.prisma.platillo.findMany();
  }

  async findOne(id: number) {
    return this.prisma.platillo.findUnique({ where: { id } });
  }

  async update(id: number, usuarioCedula: any, updatePlatilloInput: Prisma.PlatilloUpdateInput) {
    const platilloAnterior = await this.prisma.platillo.findUnique({ where: { id }, });
    const platilloActualizado = await this.prisma.platillo.update({ where: { id }, data: updatePlatilloInput, include: { detallesPedido: true } });
    try {
      await this.auditoriaService.logAction(
        usuarioCedula,
        'UPDATE', // Tipo de acción
        'platillos',       // Tabla afectada
        platilloActualizado.id.toString(),           // ID del registro (en este caso la cédula)
        platilloAnterior,  // Datos viejos (lo que buscamos en el paso 1)
        platilloActualizado // Datos nuevos (lo que devolvió el update)
      );
    } catch (error) {
      console.error('Error al auditar actualización: ', error);
    }
    //return this.prisma.platillo.update({ where: { id }, data: updatePlatilloInput });
    return platilloActualizado;
  }

  async remove(id: number) {
    return this.prisma.platillo.delete({ where: { id } });
  }
}