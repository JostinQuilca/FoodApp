import { Module } from '@nestjs/common';
import { PlatillosService } from './platillos.service';
import { PlatillosResolver } from './platillos.resolver';

@Module({
  providers: [PlatillosService, PlatillosResolver]
})
export class PlatillosModule {}
