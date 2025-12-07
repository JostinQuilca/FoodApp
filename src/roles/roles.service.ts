import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRolInput: CreateRolInput) {
    return this.prisma.rol.create({
      data: {
        nombre: createRolInput.nombre,
        estado: createRolInput.estado ?? 'ACTIVO',
      },
      include: { usuarios: true },
    });
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

  async update(id: number, updateRolInput: UpdateRolInput) {
    return this.prisma.rol.update({
      where: { id },
      data: {
        nombre: updateRolInput.nombre,
        estado: updateRolInput.estado,
      },
      include: { usuarios: true },
    });
  }

  async remove(id: number) {
    return this.prisma.rol.delete({ where: { id } });
  }
}