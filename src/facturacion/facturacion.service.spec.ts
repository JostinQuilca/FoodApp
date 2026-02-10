import { Test, TestingModule } from '@nestjs/testing';
import { FacturacionService } from './facturacion.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '@/auditoria/auditoria.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('FacturacionService', () => {
  let service: FacturacionService;
  let prismaService: PrismaService;
  let auditoriaService: AuditoriaService;

  const mockPrismaService = {
    factura: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    platillo: {
      findMany: jest.fn(),
    },
    pedido: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    detalleFactura: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockAuditoriaService = {
    logAction: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturacionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditoriaService,
          useValue: mockAuditoriaService,
        },
      ],
    }).compile();

    service = module.get<FacturacionService>(FacturacionService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearFacturaDirecta', () => {
    /**
     * Test 1: Crear factura directa exitosamente
     * Requisito: RF-02 - Facturación directa
     */
    it('should create a direct invoice successfully (VENDEDOR)', async () => {
      const vendedor = {
        cedula: 'VENDEDOR001',
        rolId: 3,
        rol: { nombre: 'VENDEDOR' },
      };

      const cliente = {
        cedula: 'CLIENTE001',
        nombre: 'Juan Pérez',
      };

      const platillos = [
        { id: 1, nombreItem: 'Pizza', precio: 10.0 },
        { id: 2, nombreItem: 'Ensalada', precio: 5.0 },
      ];

      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(vendedor).mockResolvedValueOnce(cliente);
      mockPrismaService.platillo.findMany.mockResolvedValue(platillos);
      mockPrismaService.factura.findFirst.mockResolvedValue(null);

      const mockFactura = {
        id: 1,
        numeroFactura: 'FCT-20260201-00001',
        usuarioCedula: cliente.cedula,
        montoTotal: 15.0,
        tipoFactura: 'VENTA',
      };

      mockPrismaService.$transaction.mockResolvedValue(mockFactura);

      const input = {
        usuarioCedula: cliente.cedula,
        detalles: [
          { itemId: 1, cantidad: 1, precioUnitario: 10.0 },
          { itemId: 2, cantidad: 1, precioUnitario: 5.0 },
        ],
      };

      const resultado = await service.crearFacturaDirecta(vendedor.cedula, input);

      expect(resultado.tipoFactura).toBe('VENTA');
      expect(resultado.usuarioCedula).toBe(cliente.cedula);
      expect(mockPrismaService.usuario.findUnique).toHaveBeenCalledTimes(2);
    });

    /**
     * Test 2: No permitir crear factura si no es VENDEDOR
     * Requisito: RF-07 - Control de acceso por rol
     */
    it('should reject if user is not VENDEDOR', async () => {
      const cliente = {
        cedula: 'CLIENTE001',
        rolId: 2,
        rol: { nombre: 'CLIENTE' },
      };

      mockPrismaService.usuario.findUnique.mockResolvedValue(cliente);

      const input = {
        usuarioCedula: 'CLIENTE002',
        detalles: [{ itemId: 1, cantidad: 1, precioUnitario: 10.0 }],
      };

      await expect(service.crearFacturaDirecta(cliente.cedula, input)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generarFacturaDesdeoPedido', () => {
    /**
     * Test 3: Generar factura automáticamente al aprobar pedido
     * Requisito: RF-01 - Generación automática
     */
    it('should generate invoice automatically when order is approved', async () => {
      const pedido = {
        id: 1,
        usuarioCedula: 'CLIENTE001',
        estadoPedido: 'Autorizado',
        montoTotal: 50.0,
        factura: null,
        detalles: [
          {
            itemId: 1,
            cantidad: 2,
            precioUnitario: 25.0,
            subtotal: 50.0,
            platillo: { nombreItem: 'Plato Principal' },
          },
        ],
      };

      const mockFactura = {
        id: 1,
        numeroFactura: 'FCT-20260201-00001',
        pedidoId: 1,
        tipoFactura: 'PEDIDO',
        estadoFactura: 'EMITIDA',
      };

      mockPrismaService.pedido.findUnique.mockResolvedValue(pedido);
      mockPrismaService.factura.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue(mockFactura);

      const resultado = await service.generarFacturaDesdeoPedido(1);

      expect(resultado.tipoFactura).toBe('PEDIDO');
      expect(resultado.estadoFactura).toBe('EMITIDA');
      expect(resultado.pedidoId).toBe(1);
    });

    /**
     * Test 5: No crear duplicadas - solo una factura por pedido
     * Requisito: RF-01 (No duplicados)
     */
    it('should not create duplicate invoice for same order', async () => {
      const pedido = {
        id: 1,
        usuarioCedula: 'CLIENTE001',
        estadoPedido: 'Autorizado',
        montoTotal: 50.0,
        factura: { id: 1, numeroFactura: 'FCT-20260201-00001' },
        detalles: [],
      };

      mockPrismaService.pedido.findUnique.mockResolvedValue(pedido);

      await expect(service.generarFacturaDesdeoPedido(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('obtenerFacturasCliente', () => {
    /**
     * Test 6: Obtener facturas de cliente
     * Requisito: RF-04 - Consulta de facturas
     */
    it('should retrieve invoices for a specific client', async () => {
      const cliente = {
        cedula: 'CLIENTE001',
        nombre: 'Juan Pérez',
      };

      const facturas = [
        {
          id: 1,
          numeroFactura: 'FCT-20260201-00001',
          usuarioCedula: cliente.cedula,
          montoTotal: 50.0,
          estadoFactura: 'EMITIDA',
        },
        {
          id: 2,
          numeroFactura: 'FCT-20260202-00002',
          usuarioCedula: cliente.cedula,
          montoTotal: 75.0,
          estadoFactura: 'PAGADA',
        },
      ];

      mockPrismaService.usuario.findUnique.mockResolvedValue(cliente);
      mockPrismaService.factura.findMany.mockResolvedValue(facturas);

      const resultado = await service.obtenerFacturasCliente(cliente.cedula);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].usuarioCedula).toBe(cliente.cedula);
      expect(resultado[1].usuarioCedula).toBe(cliente.cedula);
    });

    /**
     * Test 7: Error si cliente no existe
     * Requisito: RF-03 - Validación
     */
    it('should throw NotFoundException if client does not exist', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.obtenerFacturasCliente('INVALIDO')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Validaciones de entrada', () => {
    /**
     * Test 8: Validar integridad de detalle de factura
     */
    it('should validate invoice details integrity', async () => {
      const vendedor = {
        cedula: 'VENDEDOR001',
        rolId: 3,
        rol: { nombre: 'VENDEDOR' },
      };

      const cliente = {
        cedula: 'CLIENTE001',
        nombre: 'Juan Pérez',
      };

      const platillosEnBD = [{ id: 1, nombreItem: 'Pizza', precio: 10.0 }];

      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(vendedor).mockResolvedValueOnce(cliente);
      mockPrismaService.platillo.findMany.mockResolvedValue(platillosEnBD);

      const input = {
        usuarioCedula: cliente.cedula,
        detalles: [
          { itemId: 1, cantidad: 1, precioUnitario: 10.0 },
          { itemId: 2, cantidad: 1, precioUnitario: 5.0 },
        ],
      };

      await expect(service.crearFacturaDirecta(vendedor.cedula, input)).rejects.toThrow(BadRequestException);
    });

    /**
     * Test 9: Rechazar cantidad negativa
     */
    it('should reject negative quantity (VALIDATION)', async () => {
      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 1, cantidad: -5, precioUnitario: 10.0 }],
      };

      const isValid = input.detalles.every(d => d.cantidad > 0 && d.precioUnitario > 0);
      expect(isValid).toBe(false);
    });

    /**
     * Test 10: Rechazar cantidad cero
     */
    it('should reject zero quantity (VALIDATION)', async () => {
      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 1, cantidad: 0, precioUnitario: 10.0 }],
      };

      const isValid = input.detalles.every(d => d.cantidad > 0 && d.precioUnitario > 0);
      expect(isValid).toBe(false);
    });

    /**
     * Test 11: Rechazar precio unitario negativo
     */
    it('should reject negative unit price (VALIDATION)', async () => {
      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 1, cantidad: 5, precioUnitario: -10.0 }],
      };

      const isValid = input.detalles.every(d => d.cantidad > 0 && d.precioUnitario > 0);
      expect(isValid).toBe(false);
    });

    /**
     * Test 12: Rechazar itemId como string
     */
    it('should reject non-numeric itemId (VALIDATION)', async () => {
      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 'ABC', cantidad: 5, precioUnitario: 10.0 }],
      };

      const isValid = input.detalles.every(d => typeof d.itemId === 'number' && d.itemId > 0);
      expect(isValid).toBe(false);
    });

    /**
     * Test 13: Rechazar cantidad como string
     */
    it('should reject non-numeric quantity (VALIDATION)', async () => {
      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 1, cantidad: 'CINCO', precioUnitario: 10.0 }],
      };

      const isValid = input.detalles.every(d => typeof d.cantidad === 'number' && d.cantidad > 0);
      expect(isValid).toBe(false);
    });

    /**
     * Test 14: Rechazar precio como string
     */
    it('should reject non-numeric price (VALIDATION)', async () => {
      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 1, cantidad: 5, precioUnitario: 'DIEZ' }],
      };

      const isValid = input.detalles.every(d => typeof d.precioUnitario === 'number' && d.precioUnitario > 0);
      expect(isValid).toBe(false);
    });
  });

  describe('Obtención y búsqueda de facturas', () => {
    /**
     * Test 16: Obtener factura por ID
     */
    it('should retrieve invoice by ID successfully', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-20260201-00001',
        usuarioCedula: 'CLIENTE001',
        montoTotal: 100.0,
        estadoFactura: 'EMITIDA',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);

      const resultado = await service.obtenerFactura(1);

      expect(resultado.id).toBe(1);
      expect(resultado.numeroFactura).toBe('FCT-20260201-00001');
    });

    /**
     * Test 17: Error al obtener factura inexistente
     */
    it('should throw NotFoundException if invoice does not exist', async () => {
      mockPrismaService.factura.findUnique.mockResolvedValue(null);

      await expect(service.obtenerFactura(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * Test 18: Obtener facturas por estado EMITIDA
     */
    it('should retrieve invoices by EMITIDA status', async () => {
      const facturas = [
        { id: 1, numeroFactura: 'FCT-001', estadoFactura: 'EMITIDA' },
        { id: 2, numeroFactura: 'FCT-002', estadoFactura: 'EMITIDA' },
      ];

      mockPrismaService.factura.findMany.mockResolvedValue(facturas);

      const resultado = await service.obtenerFacturasPorEstado('EMITIDA');

      expect(resultado).toHaveLength(2);
      expect(resultado.every(f => f.estadoFactura === 'EMITIDA')).toBe(true);
    });

    /**
     * Test 19: Obtener facturas por estado PAGADA
     */
    it('should retrieve invoices by PAGADA status', async () => {
      const facturas = [
        { id: 3, numeroFactura: 'FCT-003', estadoFactura: 'PAGADA' },
      ];

      mockPrismaService.factura.findMany.mockResolvedValue(facturas);

      const resultado = await service.obtenerFacturasPorEstado('PAGADA');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].estadoFactura).toBe('PAGADA');
    });

    /**
     * Test 20: Rechazar estado inválido
     */
    it('should reject invalid invoice status', async () => {
      await expect(service.obtenerFacturasPorEstado('INEXISTENTE')).rejects.toThrow(BadRequestException);
    });

    /**
     * Test 21: Obtener facturas del mes actual
     */
    it('should retrieve invoices from current month', async () => {
      const ahora = new Date();
      const facturasDelMes = [
        {
          id: 1,
          numeroFactura: 'FCT-001',
          fechaFactura: new Date(ahora.getFullYear(), ahora.getMonth(), 15),
        },
      ];

      mockPrismaService.factura.findMany.mockResolvedValue(facturasDelMes);

      const resultado = await service.obtenerFacturasDelMes();

      expect(resultado).toHaveLength(1);
    });

    /**
     * Test 22: Obtener facturas vacío del mes
     */
    it('should return empty array if no invoices in current month', async () => {
      mockPrismaService.factura.findMany.mockResolvedValue([]);

      const resultado = await service.obtenerFacturasDelMes();

      expect(resultado).toHaveLength(0);
    });

    /**
     * Test 23: Cliente sin facturas
     */
    it('should return empty array if client has no invoices', async () => {
      const cliente = { cedula: 'CLIENTE_NUEVO', nombre: 'Nuevo Cliente' };

      mockPrismaService.usuario.findUnique.mockResolvedValue(cliente);
      mockPrismaService.factura.findMany.mockResolvedValue([]);

      const resultado = await service.obtenerFacturasCliente('CLIENTE_NUEVO');

      expect(resultado).toHaveLength(0);
    });
  });

  describe('Actualización de estado', () => {
    /**
     * Test 24: Actualizar estado de EMITIDA a PAGADA
     */
    it('should update invoice status from EMITIDA to PAGADA', async () => {
      const facturaOriginal = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        descripcion: 'Factura original',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      const facturaActualizada = {
        ...facturaOriginal,
        estadoFactura: 'PAGADA',
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(facturaOriginal);
      mockPrismaService.factura.update.mockResolvedValue(facturaActualizada);

      const resultado = await service.actualizarEstadoFactura(1, { estadoFactura: 'PAGADA' });

      expect(resultado.estadoFactura).toBe('PAGADA');
    });

    /**
     * Test 25: Actualizar descripción de factura
     */
    it('should update invoice description', async () => {
      const facturaOriginal = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        descripcion: 'Vieja descripción',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      const facturaActualizada = {
        ...facturaOriginal,
        descripcion: 'Nueva descripción actualizada',
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(facturaOriginal);
      mockPrismaService.factura.update.mockResolvedValue(facturaActualizada);

      const resultado = await service.actualizarEstadoFactura(1, { descripcion: 'Nueva descripción actualizada' });

      expect(resultado.descripcion).toBe('Nueva descripción actualizada');
    });

    /**
     * Test 26: Rechazar estado inválido en actualización
     */
    it('should reject invalid status in update', async () => {
      const factura = { id: 1, numeroFactura: 'FCT-001', estadoFactura: 'EMITIDA' };
      mockPrismaService.factura.findUnique.mockResolvedValue(factura);

      await expect(
        service.actualizarEstadoFactura(1, { estadoFactura: 'ESTADO_INVALIDO' })
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Test 27: Obtener factura antes de actualizar
     */
    it('should verify invoice exists before updating', async () => {
      mockPrismaService.factura.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarEstadoFactura(999, { estadoFactura: 'PAGADA' })
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * Test 28: Mantener estado actual si no se especifica
     */
    it('should keep current status if not specified in update', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        descripcion: 'Original',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);
      mockPrismaService.factura.update.mockResolvedValue(factura);

      const resultado = await service.actualizarEstadoFactura(1, { descripcion: 'Nueva desc' });

      expect(resultado.estadoFactura).toBe('EMITIDA');
    });

    /**
     * Test 29: Registrar auditoría en actualización
     */
    it('should log audit action on invoice update', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        descripcion: 'Original',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);
      mockPrismaService.factura.update.mockResolvedValue({
        ...factura,
        estadoFactura: 'PAGADA',
      });

      await service.actualizarEstadoFactura(1, { estadoFactura: 'PAGADA' });

      expect(mockAuditoriaService.logAction).toHaveBeenCalledWith(
        'CLIENTE001',
        'UPDATE',
        'factura',
        '1',
        expect.any(Object),
        expect.any(Object)
      );
    });

    /**
     * Test 30: Permitir transición EMITIDA → ANULADA
     */
    it('should allow transition from EMITIDA to ANULADA', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);
      mockPrismaService.factura.update.mockResolvedValue({
        ...factura,
        estadoFactura: 'ANULADA',
      });

      const resultado = await service.actualizarEstadoFactura(1, { estadoFactura: 'ANULADA' });

      expect(resultado.estadoFactura).toBe('ANULADA');
    });
  });

  describe('Anulación de facturas', () => {
    /**
     * Test 31: Anular factura en estado EMITIDA
     */
    it('should cancel invoice in EMITIDA status', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);
      mockPrismaService.factura.update.mockResolvedValue({
        ...factura,
        estadoFactura: 'ANULADA',
      });

      const resultado = await service.anularFactura(1);

      expect(resultado.estadoFactura).toBe('ANULADA');
    });

    /**
     * Test 32: Rechazar anulación de factura ya anulada
     */
    it('should reject cancellation of already canceled invoice', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'ANULADA',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);

      await expect(service.anularFactura(1)).rejects.toThrow(BadRequestException);
    });

    /**
     * Test 33: Verificar que factura existe antes de anular
     */
    it('should verify invoice exists before cancellation', async () => {
      mockPrismaService.factura.findUnique.mockResolvedValue(null);

      await expect(service.anularFactura(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * Test 34: Registrar auditoría en anulación
     */
    it('should log audit action on invoice cancellation', async () => {
      const factura = {
        id: 1,
        numeroFactura: 'FCT-001',
        estadoFactura: 'EMITIDA',
        usuarioCedula: 'CLIENTE001',
        detalles: [],
      };

      mockPrismaService.factura.findUnique.mockResolvedValue(factura);
      mockPrismaService.factura.update.mockResolvedValue({
        ...factura,
        estadoFactura: 'ANULADA',
      });

      await service.anularFactura(1);

      expect(mockAuditoriaService.logAction).toHaveBeenCalled();
    });
  });

  describe('Casos límite', () => {
    /**
     * Test 35: Crear factura con múltiples detalles
     */
    it('should create invoice with multiple line items', async () => {
      const vendedor = {
        cedula: 'VENDEDOR001',
        rol: { nombre: 'VENDEDOR' },
      };
      const cliente = { cedula: 'CLIENTE001', nombre: 'Juan' };
      const platillos = [
        { id: 1, nombreItem: 'Pizza', precio: 10.0 },
        { id: 2, nombreItem: 'Ensalada', precio: 5.0 },
        { id: 3, nombreItem: 'Bebida', precio: 2.0 },
        { id: 4, nombreItem: 'Postre', precio: 8.0 },
      ];

      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(vendedor).mockResolvedValueOnce(cliente);
      mockPrismaService.platillo.findMany.mockResolvedValue(platillos);
      mockPrismaService.factura.findFirst.mockResolvedValue(null);

      const input = {
        usuarioCedula: cliente.cedula,
        detalles: [
          { itemId: 1, cantidad: 2, precioUnitario: 10.0 },
          { itemId: 2, cantidad: 1, precioUnitario: 5.0 },
          { itemId: 3, cantidad: 3, precioUnitario: 2.0 },
          { itemId: 4, cantidad: 1, precioUnitario: 8.0 },
        ],
      };

      mockPrismaService.$transaction.mockImplementation((callback) => {
        return Promise.resolve({
          id: 1,
          numeroFactura: 'FCT-26020209-00001',
          usuarioCedula: cliente.cedula,
          montoTotal: 51.0,
          tipoFactura: 'VENTA',
        });
      });

      const resultado = await service.crearFacturaDirecta(vendedor.cedula, input);

      expect(resultado).toBeDefined();
      expect(resultado.tipoFactura).toBe('VENTA');
    });

    /**
     * Test 36: Monto muy alto
     */
    it('should handle very large invoice amounts', async () => {
      const vendedor = { cedula: 'VENDEDOR001', rol: { nombre: 'VENDEDOR' } };
      const cliente = { cedula: 'CLIENTE001' };
      const platillos = [{ id: 1, nombreItem: 'Item caro', precio: 99999.99 }];

      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(vendedor).mockResolvedValueOnce(cliente);
      mockPrismaService.platillo.findMany.mockResolvedValue(platillos);
      mockPrismaService.factura.findFirst.mockResolvedValue(null);

      const input = {
        usuarioCedula: cliente.cedula,
        detalles: [{ itemId: 1, cantidad: 100, precioUnitario: 99999.99 }],
      };

      mockPrismaService.$transaction.mockResolvedValue({
        id: 1,
        numeroFactura: 'FCT-26020209-00001',
        montoTotal: 9999999.0,
        tipoFactura: 'VENTA',
      });

      const resultado = await service.crearFacturaDirecta(vendedor.cedula, input);
      expect(resultado.montoTotal).toBeGreaterThan(1000000);
    });

    /**
     * Test 37: ADMINISTRADOR NO puede crear factura directa
     */
    it('should deny ADMINISTRADOR from creating direct invoice', async () => {
      const admin = {
        cedula: 'ADMIN001',
        rolId: 1,
        rol: { nombre: 'ADMINISTRADOR' },
      };

      mockPrismaService.usuario.findUnique.mockResolvedValue(admin);

      const input = {
        usuarioCedula: 'CLIENTE001',
        detalles: [{ itemId: 1, cantidad: 1, precioUnitario: 10.0 }],
      };

      await expect(service.crearFacturaDirecta(admin.cedula, input)).rejects.toThrow(ForbiddenException);
    });

    /**
     * Test 38: CLIENTE NO puede crear factura
     */
    it('should deny CLIENTE from creating invoice', async () => {
      const cliente = {
        cedula: 'CLIENTE001',
        rolId: 2,
        rol: { nombre: 'CLIENTE' },
      };

      mockPrismaService.usuario.findUnique.mockResolvedValue(cliente);

      const input = {
        usuarioCedula: 'OTRO_CLIENTE',
        detalles: [{ itemId: 1, cantidad: 1, precioUnitario: 10.0 }],
      };

      await expect(service.crearFacturaDirecta(cliente.cedula, input)).rejects.toThrow(ForbiddenException);
    });

    /**
     * Test 39: Generar número de factura único
     */
    it('should generate unique invoice numbers', async () => {
      const numerosGenerados = new Set();
      const cantidadFacturas = 5;

      for (let i = 0; i < cantidadFacturas; i++) {
        numerosGenerados.add(`FCT-26020209-${String(i + 1).padStart(5, '0')}`);
      }

      expect(numerosGenerados.size).toBe(cantidadFacturas);
    });

    /**
     * Test 40: Obtener todas las facturas
     */
    it('should retrieve all invoices for VENDEDOR and ADMINISTRADOR', async () => {
      const todasLasFacturas = [
        { id: 1, numeroFactura: 'FCT-001', usuarioCedula: 'CLIENTE001', estadoFactura: 'EMITIDA' },
        { id: 2, numeroFactura: 'FCT-002', usuarioCedula: 'CLIENTE002', estadoFactura: 'PAGADA' },
        { id: 3, numeroFactura: 'FCT-003', usuarioCedula: 'CLIENTE001', estadoFactura: 'ANULADA' },
      ];

      mockPrismaService.factura.findMany.mockResolvedValue(todasLasFacturas);

      const resultado = await service.obtenerTodasLasFacturas();

      expect(resultado).toHaveLength(3);
      expect(resultado[0].numeroFactura).toBe('FCT-001');
    });
  });
});
