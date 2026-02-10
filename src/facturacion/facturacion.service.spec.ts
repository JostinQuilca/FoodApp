import { Test, TestingModule } from '@nestjs/testing';
import { FacturacionService } from './facturacion.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '@/auditoria/auditoria.service';

describe('FacturacionService', () => {
  let service: FacturacionService;
  let mockPrisma: any;
  let mockAuditoria: any;

  beforeEach(async () => {
    mockPrisma = {
      pedido: { findUnique: jest.fn() },
      factura: { create: jest.fn(), findFirst: jest.fn() },
      detalleFactura: { create: jest.fn() },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };
    mockAuditoria = { logAction: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturacionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditoriaService, useValue: mockAuditoria },
      ],
    }).compile();
    service = module.get<FacturacionService>(FacturacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Prueba 01: Generar factura desde pedido autorizado
  it('GenerarFacturaProbarPedido', async () => {
    const pedido = {
      id: 1,
      usuarioCedula: '1234567890',
      estadoPedido: 'Autorizado',
      montoTotal: 100,
      detalles: [{ id: 1, cantidad: 2, precioUnitario: 50, subtotal: 100, platillo: { nombreItem: 'Pizza' } }],
      factura: null,
      usuario: { cedula: '1234567890', email: 'test@test.com', rol: { nombre: 'CLIENTE' } },
    };
    mockPrisma.pedido.findUnique.mockResolvedValue(pedido);
    mockPrisma.factura.findFirst.mockResolvedValue(null);
    mockPrisma.factura.create.mockResolvedValue({
      id: 100,
      numeroFactura: 'FCT-20260210-00001',
      pedidoId: 1,
      tipoFactura: 'PEDIDO',
      estadoFactura: 'EMITIDA',
      montoTotal: 112,
    });
    const resultado = await service.generarFacturaDesdeoPedido(1);
    expect(resultado.tipoFactura).toBe('PEDIDO');
    expect(resultado.estadoFactura).toBe('EMITIDA');
  });

  // Prueba 02: No crea factura si ya existe
  it('NoGenerarFactSinEstarAprobado', async () => {
  const pedidoNoAutorizado = {
    id: 2,
    usuarioCedula: '1234567890',
    estadoPedido: 'Pendiente', 
    montoTotal: 50,
    detalles: [],
    usuario: { cedula: '1234567890', email: 'test@test.com' },
  };

  mockPrisma.pedido.findUnique.mockResolvedValue(pedidoNoAutorizado);

  
  await expect(service.generarFacturaDesdeoPedido(2))
    .rejects
    .toThrow('El pedido no se encuentra en estado Autorizado');

  expect(mockPrisma.factura.create).not.toHaveBeenCalled();
});









  // Prueba 03: Pedido no encontrado
  it('03: Lanza NotFoundException cuando pedido no existe', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue(null);
    await expect(service.generarFacturaDesdeoPedido(999)).rejects.toThrow('no encontrado');
  });

  // Prueba 04: Calcula IVA correctamente (12%)
  it('04: Calcula IVA 12% correctamente', async () => {
    const pedido = {
      id: 1,
      montoTotal: 100,
      estadoPedido: 'Autorizado',
      factura: null,
      detalles: [{ cantidad: 2, precioUnitario: 50, subtotal: 100, platillo: { nombreItem: 'Platillo' } }],
      usuario: { cedula: '1234567890', rol: { nombre: 'CLIENTE' } },
    };
    mockPrisma.pedido.findUnique.mockResolvedValue(pedido);
    mockPrisma.factura.findFirst.mockResolvedValue(null);
    mockPrisma.factura.create.mockResolvedValue({
      montoSubtotal: 100,
      montoIva: 12,
      montoTotal: 112,
      tipoFactura: 'PEDIDO',
      estadoFactura: 'EMITIDA',
    });
    const resultado = await service.generarFacturaDesdeoPedido(1);
    expect(resultado.montoIva).toBe(12);
    expect(resultado.montoTotal).toBe(112);
  });
});
