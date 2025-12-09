import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule, ConfigService } from '@nestjs/config';

// Módulos del proyecto
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    // Necesario para usar estrategias de auth, guards, etc.
    PassportModule,

    // Necesitas UsuariosService dentro de auth
    UsuariosModule,

    // 🔥 IMPORTANTE: necesario para inyectar AuditoriaService
    AuditoriaModule,

    // Para JWT_SECRET y variables de entorno
    ConfigModule,

    // Para usar PrismaService dentro de AuthService
    PrismaModule,

    // Configuración asíncrona del JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'clave_secreta_temporal_fallback',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],

  providers: [
    AuthService,
    AuthResolver,
  ],

  // Exportaciones en caso de que otro módulo necesite AuthService
  exports: [AuthService],
})
export class AuthModule {}
