import { Injectable } from '@nestjs/common';
import { CreateClienteInput } from './dto/create-cliente.input';

// NOTA: EL CÓDIGO DE BASE DE DATOS FUE MOVIDO A USUARIOS SERVICE.

@Injectable()
export class ClientesService {
  // Stubs para evitar errores si otros módulos lo están llamando
  create(createClienteInput: CreateClienteInput) {
    return `CLIENTE service is deprecated. Use UsuariosService.`;
  }

  findAll() {
    return [];
  }
}
