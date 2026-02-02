import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosResolver } from './usuarios.resolver';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';

@Module({
  providers: [UsuariosResolver, UsuariosService],
  imports:[AuditoriaModule]
})
export class UsuariosModule {}
