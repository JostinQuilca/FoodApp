import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosResolver } from './usuarios.resolver';
import { UsuariosService } from './usuarios.service';

describe('UsuariosResolver', () => {
  let resolver: UsuariosResolver;

  beforeEach(async () => {
    const mockUsuariosService = { findAll: jest.fn(), findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosResolver,
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    resolver = module.get<UsuariosResolver>(UsuariosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
