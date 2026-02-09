import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FacturacionService', () => {
  let service: FacturacionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    factura: {
      count: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturacionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FacturacionService>(FacturacionService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      mockPrismaService.factura.count.mockResolvedValue(0);

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
    it('should reject if user is not VENDEDOR or ADMINISTRADOR', async () => {
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
      mockPrismaService.factura.count.mockResolvedValue(0);
      mockPrismaService.$transaction.mockResolvedValue(mockFactura);

      const resultado = await service.generarFacturaDesdeoPedido(1);

      expect(resultado.tipoFactura).toBe('PEDIDO');
      expect(resultado.estadoFactura).toBe('EMITIDA');
      expect(resultado.pedidoId).toBe(1);
    });

    /**
     * Test 4: No generar factura si pedido no está aprobado
     * Requisito: RF-01 (Restricción)
     */
    it('should not generate invoice if order is not approved', async () => {
      const pedido = {
        id: 1,
        usuarioCedula: 'CLIENTE001',
        estadoPedido: 'Pendiente', // ← No autorizado
        montoTotal: 50.0,
        factura: null,
        detalles: [],
      };

      mockPrismaService.pedido.findUnique.mockResolvedValue(pedido);

      await expect(service.generarFacturaDesdeoPedido(1)).rejects.toThrow(BadRequestException);
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
        factura: { id: 1, numeroFactura: 'FCT-20260201-00001' }, // ← Ya existe
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
     * Requisito: RF-03 - Asociación cliente-factura
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

  describe('Integridad y validaciones', () => {
    /**
     * Test 8: Validar integridad de detalle de factura
     * Requisito: RNF-05 - Integridad
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

      // Items solicitados: 1 y 2, pero solo existe 1
      const platillosEnBD = [{ id: 1, nombreItem: 'Pizza', precio: 10.0 }];

      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(vendedor).mockResolvedValueOnce(cliente);
      mockPrismaService.platillo.findMany.mockResolvedValue(platillosEnBD);

      const input = {
        usuarioCedula: cliente.cedula,
        detalles: [
          { itemId: 1, cantidad: 1, precioUnitario: 10.0 },
          { itemId: 2, cantidad: 1, precioUnitario: 5.0 }, // Este no existe
        ],
      };

      await expect(service.crearFacturaDirecta(vendedor.cedula, input)).rejects.toThrow(BadRequestException);
    });
  });
});
