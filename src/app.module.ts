import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <--- Falta esto
import { GraphQLModule } from '@nestjs/graphql'; // <--- Falta esto
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'; // <--- Falta esto
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [
    // 1. Cargar el archivo .env (Vital para la base de datos)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Encender el motor GraphQL (Esto crea la ruta /graphql)
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true, // Esto habilita la pantalla visual
    }),

    // 3. Tus módulos
    PrismaModule,
    AuthModule,
    ClientesModule,
  ],
})
export class AppModule {}
