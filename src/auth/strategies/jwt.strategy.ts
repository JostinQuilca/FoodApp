import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'clave_secreta_temporal_fallback',
    });
  }

  async validate(payload: any) {
  const usuario = await this.usuariosService.findByCedula(payload.sub);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  return {
    cedula: usuario.cedula,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  };
}
}
