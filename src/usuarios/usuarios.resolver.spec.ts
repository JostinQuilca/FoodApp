import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosResolver } from './usuarios.resolver';
import { UsuariosService } from './usuarios.service';

describe('UsuariosResolver', () => {
  let resolver: UsuariosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosResolver, UsuariosService],
    }).compile();

    resolver = module.get<UsuariosResolver>(UsuariosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
