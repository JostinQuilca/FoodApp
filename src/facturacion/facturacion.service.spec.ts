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
      factura: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
      detalleFactura: { create: jest.fn() },
      usuario: { findUnique: jest.fn() },
      platillo: { findMany: jest.fn() },
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
      usuarioCedula: '1234567890', // Necesario para auditoriaFactura
    });
    const resultado = await service.generarFacturaDesdeoPedido(1);
    expect(resultado.tipoFactura).toBe('PEDIDO');
    expect(resultado.estadoFactura).toBe('EMITIDA');
  });

  // Prueba 02: No genera factura si el pedido no está autorizado
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
    .toThrow(
      "No se puede generar factura: Pedido debe estar en estado 'Autorizado', estado actual: Pendiente",
    );

  expect(mockPrisma.factura.create).not.toHaveBeenCalled();
});

  // Prueba 03: Creación correcta de factura directa
  it('05: Creación correcta de factura directa por un VENDEDOR', async () => {
    const vendedorCedula = 'VENDEDOR_CEDULA';
    const clienteCedula = 'CLIENTE_CEDULA';
    const input = {
      usuarioCedula: clienteCedula,
      detalles: [
        { itemId: 1, cantidad: 2, precioUnitario: 10 }, 
        { itemId: 2, cantidad: 1, precioUnitario: 5 }, 
      ],
      descripcion: 'Venta directa de prueba',
    };

    mockPrisma.usuario.findUnique.mockResolvedValueOnce({
      cedula: vendedorCedula,
      rol: { nombre: 'VENDEDOR' },
    });

    // 2. Mock para el usuario CLIENTE de la factura
    mockPrisma.usuario.findUnique.mockResolvedValueOnce({
      cedula: clienteCedula,
    });
    // 3. Mock para los platillos/items que se están facturando
    mockPrisma.platillo.findMany.mockResolvedValue([
      { id: 1, nombreItem: 'Item 1', precio: 10 },
      { id: 2, nombreItem: 'Item 2', precio: 5 },
    ]);
    // 4. Mock para generarNumeroFactura (asumimos que no hay facturas hoy)
    mockPrisma.factura.findFirst.mockResolvedValue(null);
    const facturaCreadaMock = {
      id: 200,
      numeroFactura: 'FCT-20240101-00001',
      usuarioCedula: clienteCedula,
      montoSubtotal: 25,
      montoIva: 3,       // 25 * 0.12
      montoTotal: 28,    // 25 + 3
      estadoFactura: 'EMITIDA',
      tipoFactura: 'VENTA',
      descripcion: 'Venta directa de prueba',
    };
    // 5. Mock para la creación de la factura dentro de la transacción
    mockPrisma.factura.create.mockResolvedValue(facturaCreadaMock);
    // Act: Ejecutar el método a probar
    const resultado = await service.crearFacturaDirecta(vendedorCedula, input);
    // Assert: Verificar los resultados
    expect(resultado).toEqual(facturaCreadaMock);
    expect(mockPrisma.factura.create).toHaveBeenCalled();
    const createData = mockPrisma.factura.create.mock.calls[0][0].data;
    expect(createData.montoSubtotal).toBe(25);
    expect(createData.montoIva).toBe(3);
    expect(createData.montoTotal).toBe(28);
    expect(createData.tipoFactura).toBe('VENTA');

    // Verificar que se crearon los detalles de la factura
    expect(mockPrisma.detalleFactura.create).toHaveBeenCalledTimes(2);

    // Verificar que se llamó a la auditoría
    expect(mockAuditoria.logAction).toHaveBeenCalledWith(
      clienteCedula, 'INSERT', 'factura', facturaCreadaMock.id.toString(), null, facturaCreadaMock
    );
  });

  // Prueba 04: Asociación correcta cliente–factura
  it('AsociaciónCorrectaCliente–factura', async () => {
    const clienteCedula = 'CLIENTE_CON_FACTURAS';
    const otroClienteCedula = 'OTRO_CLIENTE';

    mockPrisma.usuario.findUnique.mockResolvedValue({ cedula: clienteCedula });

    const facturasMock = [
      { id: 1, usuarioCedula: clienteCedula, montoTotal: 100 },
      { id: 2, usuarioCedula: otroClienteCedula, montoTotal: 50 }, 
      { id: 3, usuarioCedula: clienteCedula, montoTotal: 200 },
    ];

    const facturasEsperadas = facturasMock.filter(f => f.usuarioCedula === clienteCedula);

    mockPrisma.factura.findMany.mockResolvedValue(facturasEsperadas);

    const resultado = await service.obtenerFacturasCliente(clienteCedula);

    expect(resultado).toHaveLength(2);
    expect(resultado[0].usuarioCedula).toBe(clienteCedula);
    expect(resultado[1].usuarioCedula).toBe(clienteCedula);

    expect(mockPrisma.factura.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuarioCedula: clienteCedula, estado: 'ACTIVO' } }),
    );
  });
});
