import { Module } from '@nestjs/common';
import { PlatillosService } from './platillos.service';
import { PlatillosResolver } from './platillos.resolver';
import { AuditoriaModule } from '../auditoria/auditoria.module'; 

@Module({
  providers: [PlatillosService, PlatillosResolver, AuditoriaModule]
})
export class PlatillosModule {}
