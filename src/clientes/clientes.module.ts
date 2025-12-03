import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesResolver } from './clientes.resolver';

@Module({
  providers: [ClientesResolver, ClientesService],
})
export class ClientesModule {}
