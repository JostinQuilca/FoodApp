import { Injectable } from '@nestjs/common';
import { CreateClienteInput } from './dto/create-cliente.input';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteInput: CreateClienteInput) {
    // AQUÍ: Usa 'this.prisma.cliente' (Singular)
    // Si sigue dando error, prueba 'this.prisma.clientes' (Plural, a veces Prisma lo pluraliza solo)
    // ... dentro del método create ...
    return await this.prisma.cliente.create({
      data: {
        nombre: createClienteInput.nombre,
        apellido: createClienteInput.apellido, // <--- Nuevo
        telefono: createClienteInput.telefono, // <--- Nuevo
        email: createClienteInput.email,
        contrasenaHash: createClienteInput.password,
        direccionPrincipal: createClienteInput.direccionPrincipal,
      },
    });
  }

  async findAll() {
    return await this.prisma.cliente.findMany();
  }
}
