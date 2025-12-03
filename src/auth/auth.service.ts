import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    // 1. Buscar usuario por email
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // 2. Comparar el hash
    const isPasswordValid = await bcrypt.compare(pass, user.contrasenaHash);
    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    // 3. Devolver el objeto de usuario completo (para que el JWT tome la cédula)
    const { contrasenaHash, ...result } = user;
    return result;
  }

  async login(loginInput: LoginInput) {
    const user = await this.validateUser(loginInput.email, loginInput.password);

    // 🚨 FIX: user ahora tiene la propiedad 'cedula' porque la base de datos la devuelve
    const payload = {
      sub: user.cedula,
      email: user.email,
      rol: user.rol.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
