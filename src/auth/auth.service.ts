import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Prisma } from '@prisma/client';

type UsuarioConRol = Prisma.UsuarioGetPayload<{ include: { rol: true } }>;
type UsuarioConRolSinHash = Omit<UsuarioConRol, 'contrasenaHash'>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditoriaService: AuditoriaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UsuarioConRolSinHash> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!user) {
      await this.logFailure('N/A', 'USER_NOT_FOUND', email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.contrasenaHash);

    if (!isPasswordValid) {
      await this.logFailure(user.cedula, 'INVALID_PASSWORD', user.email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { contrasenaHash, ...result } = user;
    return result as UsuarioConRolSinHash;
  }

  async login(loginInput: LoginInput) {
    const user = await this.validateUser(loginInput.email, loginInput.password);

    const payload = {
      sub: user.cedula,
      email: user.email,
      rol: user.rol.nombre,
    };

    try {
      await this.auditoriaService.logAction(
        user.cedula,
        'LOGIN_SUCCESS',
        'usuarios',
        user.cedula,
        null,
        { action: 'Inicio de sesión exitoso', email: user.email },
      );
    } catch (auditError) {
      console.error('Error al registrar la auditoría de login exitoso:', auditError);
    }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  private async logFailure(cedula: string, reason: string, emailAttempt: string) {
    try {
      const cedulaRegistro = cedula === 'N/A' ? 'N/A' : cedula;

      await this.auditoriaService.logAction(
        cedulaRegistro,
        'LOGIN_FAILURE',
        'usuarios',
        cedulaRegistro,
        { reason, emailAttempt },
        null,
      );
    } catch (auditError) {
      console.error('Error al registrar auditoría de fallo:', auditError);
    }
  }
}
