import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from './entities/auditoria.entity';
import { CreateAuditoriaInput } from './dto/create-auditoria.input';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // Protege para admins

@Resolver(() => Auditoria)
export class AuditoriaResolver {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Mutation(() => Auditoria)
  //@UseGuards(JwtAuthGuard)
  create(@Args('createAuditoriaInput') createAuditoriaInput: CreateAuditoriaInput) {
    return this.auditoriaService.create(createAuditoriaInput);
  }

  @Query(() => [Auditoria], { name: 'auditorias' })
  //@UseGuards(JwtAuthGuard)
  findAll() {
    return this.auditoriaService.findAll();
  }

  @Query(() => Auditoria, { name: 'auditoria', nullable: true })
 // @UseGuards(JwtAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.auditoriaService.findOne(id);
  }
  @Query(() => [Auditoria], { name: 'auditoriasPorUsuarioCedula' })
findByUsuarioCedula(
  @Args('usuarioCedula', { type: () => String }) usuarioCedula: string,
) {
  return this.auditoriaService.findByUsuarioCedula(usuarioCedula);
}
}