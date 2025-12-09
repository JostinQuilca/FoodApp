import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
   imports: [
   PassportModule,
 UsuariosModule,
    // ¡CORRECCIÓN! Debes importar el módulo para que NestJS resuelva la dependencia
    AuditoriaModule, 
 ConfigModule, // Asegúrate de que ConfigModule esté aquí si ConfigService lo necesita
    
 JwtModule.registerAsync({
 imports: [ConfigModule],

inject: [ConfigService],
 useFactory: async (config: ConfigService) => ({
secret: config.get('JWT_SECRET') || 'clave_secreta_temporal_fallback',
 signOptions: { expiresIn: '1d' }, }),
 }),
 ], providers: [AuthService, AuthResolver],
 exports: [AuthService],
})
export class AuthModule {}
