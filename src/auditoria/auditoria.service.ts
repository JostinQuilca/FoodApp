import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAuditoriaInput } from './dto/create-auditoria.input';

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  
  async create(data: CreateAuditoriaInput) {
  return this.prisma.auditoria.create({
    data,
    include: { usuario: true },
  });
}
async findByUsuarioCedula(usuarioCedula: string) {
  return this.prisma.auditoria.findMany({
    where: { usuarioCedula },
    include: { usuario: true },
  });
}
  async findAll() {
    return this.prisma.auditoria.findMany({ include: { usuario: true } });
  }

  async findOne(id: number) {
    return this.prisma.auditoria.findUnique({ where: { id }, include: { usuario: true } });
  }

  // No update/delete típicos para logs, pero si quieres:
  // async update(id: number, data: Prisma.AuditoriaUpdateInput) { ... }
  // async remove(id: number) { ... }
}