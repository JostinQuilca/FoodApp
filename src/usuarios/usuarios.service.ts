import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  // src/usuarios/usuarios.service.ts (Solo el método create)

  async create(input: CreateUsuarioInput) {
    // 1. Encriptar la contraseña (Esto ya es el hash)
    const salt = await bcrypt.genSalt(10); // Asegurarse de usar bcrypt
    const hashedPassword = await bcrypt.hash(input.password, salt);

    try {
      return await this.prisma.usuario.create({
        data: {
          nombre: input.nombre,
          email: input.email,
          direccionPrincipal: input.direccionPrincipal,
          rolId: input.rolId,

          // 🚨 EL ARREGLO ESTÁ AQUÍ: Usamos el nombre REAL de la columna de la DB
          contrasenaHash: hashedPassword,
          // Ya no debe aparecer el campo 'password' aquí
        },
        include: { rol: true },
      });
    } catch (e) {
      // ... manejo de errores
    }
  }
  async findAll() {
    return this.prisma.usuario.findMany({ include: { rol: true } });
  }
}
