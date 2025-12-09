import { Resolver, Query } from '@nestjs/graphql';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from './auditoria.entity';

@Resolver(() => Auditoria)
export class AuditoriaResolver {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Query(() => [Auditoria], { name: 'auditorias' })
  findAll() {
    return this.auditoriaService.getAll();
  }
}
