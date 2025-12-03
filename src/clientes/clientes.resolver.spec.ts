import { Test, TestingModule } from '@nestjs/testing';
import { ClientesResolver } from './clientes.resolver';
import { ClientesService } from './clientes.service';

describe('ClientesResolver', () => {
  let resolver: ClientesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientesResolver, ClientesService],
    }).compile();

    resolver = module.get<ClientesResolver>(ClientesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
