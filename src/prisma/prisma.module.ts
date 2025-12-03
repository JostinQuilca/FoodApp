import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- ¡Esto es vital! Sin esto, los otros módulos no verán la base de datos.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
