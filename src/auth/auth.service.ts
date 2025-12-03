import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // Usamos PrismaService directo
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }, // Traemos el rol
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 1. Comparar la contraseña enviada con el hash guardado
    const isPasswordValid = await bcrypt.compare(pass, user.contrasenaHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Devolver el usuario (sin el hash)
    const { contrasenaHash, ...result } = user;
    return result;
  }

  async login(loginInput: LoginInput) {
    // Llama al validador
    const user = await this.validateUser(loginInput.email, loginInput.password);

    // 1. Generar Payload del Token con el rol
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol.nombre, // El rol es clave para la autorización
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
