import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { PlatillosService } from './platillos.service';
import { Platillo } from './entities/platillo.entity';
import { CreatePlatilloInput } from './dto/create-platillo.input';
import { UpdatePlatilloInput } from './dto/update-platillo.input';
import { UseGuards } from '@nestjs/common';  // Para auth
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // Asume que existe

@Resolver(() => Platillo)
export class PlatillosResolver {
  constructor(private readonly platillosService: PlatillosService) {}

  @Mutation(() => Platillo)
  //@UseGuards(JwtAuthGuard)  // Protege con auth
  createPlatillo(@Args('createPlatilloInput') createPlatilloInput: CreatePlatilloInput,@Context() context:any) {
    //const usuarioCedula = context.req.user.cedula;
    const usuarioCedula="1005277489"
    return this.platillosService.create(createPlatilloInput,usuarioCedula);
  }

  @Query(() => [Platillo], { name: 'platillos' })
  findAll() {
    return this.platillosService.findAll();
  }

  @Query(() => Platillo, { name: 'platillo' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.platillosService.findOne(id);
  }

  @Mutation(() => Platillo)
  //@UseGuards(JwtAuthGuard)
  updatePlatillo(
    @Args('updatePlatilloInput') updatePlatilloInput: UpdatePlatilloInput,@Context() context:any
  ) {
    const usuarioCedula="1005277489"
    return this.platillosService.update(updatePlatilloInput.id,usuarioCedula, updatePlatilloInput);
  }

  @Mutation(() => Platillo)
  //@UseGuards(JwtAuthGuard)
  removePlatillo(@Args('id', { type: () => Int }) id: number) {
    return this.platillosService.remove(id);
  }
}