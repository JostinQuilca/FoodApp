import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(async () => {
    const mockPrisma = {};
    const mockAuditoria = { logAction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditoriaService, useValue: mockAuditoria },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
