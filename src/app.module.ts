import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// 🚨 AQUÍ ESTABA EL ERROR: Faltaba importar los módulos que creamos
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module'; // Depende de tu estructura

@Module({
  imports: [
    // 1. Configuración Global (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Motor GraphQL (Vital para /graphql)
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),

    // 3. Módulos de la Aplicación
    PrismaModule, // <--- Ahora lo encuentra
    AuthModule,
    UsuariosModule,
    ClientesModule,
  ],
  // Controllers y Providers son opcionales aquí si no usamos rutas REST
})
export class AppModule {}
