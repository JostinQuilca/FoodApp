import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Guard JWT para proteger endpoints
 * Válido para REST y GraphQL
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Sobreescribir para permitir contexto de GraphQL
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token no válido o expirado');
    }
    return user;
  }
}
