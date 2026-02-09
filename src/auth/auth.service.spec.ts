import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const mockPrisma = {};
    const mockJwt = { sign: jest.fn() };
    const mockAuditoria = { logAction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: AuditoriaService, useValue: mockAuditoria },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
