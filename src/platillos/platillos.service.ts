import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePlatilloInput } from './dto/create-platillo.input';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'; // Necesario para el hash
import { Prisma } from '@prisma/client';
@Injectable()
export class PlatillosService {
  constructor(private prisma: PrismaService) {}

  async create(createPlatilloInput: Prisma.PlatilloCreateInput) {
    return this.prisma.platillo.create({ data: createPlatilloInput });
  }

  async findAll() {
    return this.prisma.platillo.findMany();
  }

  async findOne(id: number) {
    return this.prisma.platillo.findUnique({ where: { id } });
  }

  async update(id: number, updatePlatilloInput: Prisma.PlatilloUpdateInput) {
    return this.prisma.platillo.update({ where: { id }, data: updatePlatilloInput });
  }

  async remove(id: number) {
    return this.prisma.platillo.delete({ where: { id } });
  }
}