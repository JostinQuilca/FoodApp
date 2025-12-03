import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // Opcional: desconectar al cerrar (buena práctica)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
