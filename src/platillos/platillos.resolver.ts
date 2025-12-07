import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlatillosService } from './platillos.service';
import { Platillo } from './entities/platillo.entity';
import { CreatePlatilloInput } from './dto/create-platillo.input';
import { UpdatePlatilloInput } from './dto/update-platillo.input';
import { UseGuards } from '@nestjs/common';  // Para auth
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // Asume que existe

@Resolver(() => Platillo)
export class PlatillosResolver {
  constructor(private readonly platillosService: PlatillosService) {}

  @Mutation(() => Platillo)
  //@UseGuards(JwtAuthGuard)  // Protege con auth
  createPlatillo(@Args('createPlatilloInput') createPlatilloInput: CreatePlatilloInput) {
    return this.platillosService.create(createPlatilloInput);
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
    @Args('updatePlatilloInput') updatePlatilloInput: UpdatePlatilloInput,
  ) {
    return this.platillosService.update(updatePlatilloInput.id, updatePlatilloInput);
  }

  @Mutation(() => Platillo)
  //@UseGuards(JwtAuthGuard)
  removePlatillo(@Args('id', { type: () => Int }) id: number) {
    return this.platillosService.remove(id);
  }
}