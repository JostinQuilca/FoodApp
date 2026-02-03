import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';
import { AuditoriaService } from '@/auditoria/auditoria.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService,
    private auditoriaService: AuditoriaService
  ) { }

  async create(createRolInput: CreateRolInput, usuarioCedula: any) {
    const rolNuevo = await this.prisma.rol.create({
      data: {
        nombre: createRolInput.nombre,
        estado: createRolInput.estado ?? 'ACTIVO',
      },
      include: { usuarios: true },
    });

    try {
      await this.auditoriaService.logAction(
        usuarioCedula,
        'INSERT', // Tipo de acción
        'roles',       // Tabla afectada
        rolNuevo.id.toString(),           // ID del registro (en este caso la cédula)
        null,  // Datos viejos (lo que buscamos en el paso 1)
        rolNuevo // Datos nuevos (lo que devolvió el update)
      );
    } catch (error) {
      console.error('Error al auditar creación: ', error);
    }

    return rolNuevo;
  }

  async findAll() {
    return this.prisma.rol.findMany({
      include: { usuarios: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.rol.findUnique({
      where: { id },
      include: { usuarios: true },
    });
  }

  async update(id: number, usuarioCedula: any, updateRolInput: UpdateRolInput) {
    const rolAnterior = await this.prisma.rol.findUnique({ where: { id } });
    const rolActualizado = await this.prisma.rol.update({
      where: { id },
      data: {
        nombre: updateRolInput.nombre,
        estado: updateRolInput.estado,
      },
      include: { usuarios: true },
    });

    try {
      await this.auditoriaService.logAction(
        usuarioCedula,
        'UPDATE', // Tipo de acción
        'roles',       // Tabla afectada
        rolActualizado.id.toString(),           // ID del registro (en este caso la cédula)
        rolAnterior,  // Datos viejos (lo que buscamos en el paso 1)
        rolActualizado // Datos nuevos (lo que devolvió el update)
      );
    } catch (error) {
      console.error('Error al auditar actualización: ', error);
    }

    return rolActualizado;
  }

  async remove(id: number) {
    return this.prisma.rol.delete({ where: { id } });
  }
}