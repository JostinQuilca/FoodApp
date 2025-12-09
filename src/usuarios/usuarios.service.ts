import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'; // Necesario para el hash

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateUsuarioInput) {
    // 1. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    try {
      // 2. Mapeo de datos para la inserción en la DB
      const dataToCreate = {
        cedula: input.cedula,
        nombre: input.nombre,
        email: input.email,
        direccionPrincipal: input.direccionPrincipal,
        rolId: input.rolId,
        contrasenaHash: hashedPassword, // Guardamos el hash

        // Mapeo de opcionales (forzamos NULL si el input es undefined)
        apellido: input.apellido ?? null,
        telefono: input.telefono ?? null,
      };

      return await this.prisma.usuario.create({
        data: dataToCreate,
        include: { rol: true }, // Devolvemos el rol
      });
    } catch (error) {
      // 🚨 BLOQUE DE DIAGNÓSTICO: Registrar el error de la base de datos
      console.error('--- ERROR DE BASE DE DATOS CRÍTICO ---');
      console.error(error);
      console.error('--------------------------------------');

      // P2002: Si es un error de unicidad (email, cedula, telefono ya existen)
      if (error.code === 'P2002') {
        throw new InternalServerErrorException(
          'El email, teléfono o cédula ya están registrados.',
        );
      }

      // Error genérico si el fallo no fue P2002 (ej. faltó un campo NOT NULL)
      throw new InternalServerErrorException(
        'Error interno al crear usuario. Consulte los logs del servidor.',
      );
    }
  }

  // Métodos necesarios para el Login y Queries
  async findAll() {
    return this.prisma.usuario.findMany({ include: { rol: true } });
  }
  async findByRolId(rolId: number) {
    return this.prisma.usuario.findMany({
     where: { rolId },
      include: { rol: true },
    });
  }
async updateEstado(cedula: string, nuevoEstado: string) {
  return this.prisma.usuario.update({
    where: { cedula },
    data: { estado: nuevoEstado },
    include: { rol: true },
  });
}
  async findOneByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });
  }

  // Métodos placeholder para el CRUD
  findOne(id: number) {
    return null;
  }
  update(id: number, updateInput: any) {
    return `Update #${id}`;
  }
  remove(id: number) {
    return `Remove #${id}`;
  }
}
