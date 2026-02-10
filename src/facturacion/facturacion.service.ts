import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaInput } from './dto/create-factura.input';
import { UpdateFacturaInput } from './dto/update-factura.input';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditoriaService } from '@/auditoria/auditoria.service';

@Injectable()
export class FacturacionService {
  constructor(private prisma: PrismaService,
    private auditoriaService: AuditoriaService
  ) { }

  /**
   * Generar número de factura único
   * Formato: FCT-YYYYMMDD-XXXXX
   */
 /**
 * Generar número de factura único
 * Se recomienda pasar el 'tx' (prisma client de la transacción) para evitar colisiones
 */
private async generarNumeroFactura(tx?: any): Promise<string> {
  const prismaClient = tx || this.prisma;
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  
  const inicioDelDia = new Date(año, fecha.getMonth(), fecha.getDate());
  const finDelDia = new Date(año, fecha.getMonth(), fecha.getDate() + 1);
  
  // En lugar de count, buscamos la última factura emitida hoy
  const ultimaFactura = await prismaClient.factura.findFirst({
    where: {
      fechaFactura: {
        gte: inicioDelDia,
        lt: finDelDia,
      },
    },
    orderBy: { id: 'desc' }, // O por numeroFactura si es incremental
    select: { numeroFactura: true }
  });

  let nuevoSecuencial = 1;

  if (ultimaFactura) {
    // Extraer el número después del último guion: FCT-YYYYMMDD-XXXXX
    const partes = ultimaFactura.numeroFactura.split('-');
    const ultimoNumero = parseInt(partes[partes.length - 1], 10);
    nuevoSecuencial = ultimoNumero + 1;
  }
  
  const secuencialFormateado = String(nuevoSecuencial).padStart(5, '0');
  return `FCT-${año}${mes}${dia}-${secuencialFormateado}`;
}

  /**
   * Crear factura directa (solo VENDEDOR)
   * RF-02: Facturación directa sin pedido previo
   * IMPORTANTE: Solo VENDEDOR puede crear, NO ADMINISTRADOR
   */
  async crearFacturaDirecta(usuarioActualCedula: string, input: CreateFacturaInput): Promise<any> {
    // Validar que el usuario existe y es VENDEDOR (RESTRICCIÓN ESTRICTA)
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { cedula: usuarioActualCedula },
      include: { rol: true },
    });

    if (!usuarioActual) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuarioActual.rol.nombre !== 'VENDEDOR') {
      throw new ForbiddenException('Solo VENDEDOR puede crear facturas directas');
    }

    // Validar que el cliente existe
    const cliente = await this.prisma.usuario.findUnique({
      where: { cedula: input.usuarioCedula },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con cédula ${input.usuarioCedula} no encontrado`);
    }

    // Validar que los items existen y obtener precios
    const itemIds = input.detalles.map(d => d.itemId);
    const platillos = await this.prisma.platillo.findMany({
      where: { id: { in: itemIds } },
    });

    if (platillos.length !== itemIds.length) {
      throw new BadRequestException('Uno o más items no existen en el sistema');
    }

    // Calcular montos
    let montoSubtotal = new Decimal(0);
    const detallesConSubtotal = input.detalles.map(detalle => {
      const subtotal = new Decimal(detalle.cantidad).times(new Decimal(detalle.precioUnitario));
      montoSubtotal = montoSubtotal.plus(subtotal);
      return {
        ...detalle,
        subtotal: subtotal.toNumber(),
      };
    });

    const montoIva = input.montoIva ? new Decimal(input.montoIva) : montoSubtotal.times(new Decimal('0.12')); // 12% IVA por defecto
    const montoTotal = montoSubtotal.plus(montoIva);
    const numeroFactura = await this.generarNumeroFactura();

    // Crear factura con detalles en transacción
    return this.prisma.$transaction(async (tx) => {
      // Calcular fecha de vencimiento (30 días por defecto)
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

      const factura = await tx.factura.create({
        data:{
          numeroFactura,
          usuarioCedula: input.usuarioCedula,
          fechaFactura: new Date(),
          fechaVencimiento, // ← Agregado
          montoSubtotal: montoSubtotal.toNumber(),
          montoIva: montoIva.toNumber(),
          montoTotal: montoTotal.toNumber(),
          estadoFactura: 'EMITIDA',
          tipoFactura: 'VENTA', // Factura directa
          descripcion: input.descripcion,
          estado: 'ACTIVO',
        },
        include: {
          usuario: {
            include: { rol: true },
          },
          detalles: {
            include: { platillo: true },
          },
        },
      });

      // Crear detalles de factura
      for (const detalle of detallesConSubtotal) {
        await tx.detalleFactura.create({
          data: {
            facturaId: factura.id,
            itemId: detalle.itemId,
            cantidad: detalle.cantidad,
            precioUnitario: new Decimal(detalle.precioUnitario),
            subtotal: new Decimal(detalle.subtotal),
            estado: 'ACTIVO',
          },
        });
      }

      this.auditoriaFactura(null, factura, 'INSERT');

      return factura;
    });
  }

  async auditoriaFactura(facturaAnterior: any, facturaNueva: any, action: string) {
    try {
      await this.auditoriaService.logAction(
        facturaNueva.usuarioCedula,
        action,
        'factura',
        facturaNueva.id.toString(),
        facturaAnterior ?? null,
        facturaNueva 
      );
    } catch (error) {
      console.error('Error auditando factura:', error);
    }
  }

  /**
   * Generar factura automáticamente desde un pedido aprobado
   * RF-01: Generación automática cuando pedido es aprobado
   */
  async generarFacturaDesdeoPedido(pedidoId: number): Promise<any> {
    // Validar que el pedido existe y está autorizado
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        usuario: { include: { rol: true } },
        detalles: { include: { platillo: true } },
        factura: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${pedidoId} no encontrado`);
    }

    /*if (pedido.estadoPedido !== 'Autorizado') {
      throw new BadRequestException(
        `No se puede generar factura: Pedido debe estar en estado 'Autorizado', estado actual: ${pedido.estadoPedido}`,
      );
    }*/

    // Verificar que no exista factura previa (RF: Un pedido = una factura máximo)
    if (pedido.factura) {
      throw new BadRequestException(`Ya existe una factura para este pedido: ${pedido.factura.numeroFactura}`);
    }

    
    // Calcular fecha de vencimiento (30 días por defecto)
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    
    // Calcular montos basados en los detalles del pedido (subtotal, IVA 12%)
    const montoSubtotalDecimal = pedido.detalles && pedido.detalles.length
      ? pedido.detalles.reduce((acc, d) => {
          const subtotal = d.subtotal ? new Decimal(d.subtotal) : new Decimal(d.cantidad).times(new Decimal(d.precioUnitario));
          return acc.plus(subtotal);
        }, new Decimal(0))
      : new Decimal(pedido.montoTotal ?? 0);

    const montoIvaDecimal = montoSubtotalDecimal.times(new Decimal('0.12'));
    const montoTotalDecimal = montoSubtotalDecimal.plus(montoIvaDecimal);

    return this.prisma.$transaction(async (tx) => {
      // Crear factura con detalles en transacción
    const numeroFactura = await this.generarNumeroFactura();
      const factura = await tx.factura.create({
        data: {
          numeroFactura,
          usuarioCedula: pedido.usuarioCedula,
          pedidoId: pedido.id,
          fechaFactura: new Date(),
          fechaVencimiento, // ← Agregado
          montoSubtotal: montoSubtotalDecimal.toNumber(),
          montoIva: montoIvaDecimal.toNumber(),
          montoTotal: montoTotalDecimal.toNumber(),
          estadoFactura: 'EMITIDA',
          tipoFactura: 'PEDIDO', // Factura automática
          descripcion: `Factura generada automáticamente desde Pedido #${pedidoId}`,
          estado: 'ACTIVO',
        },
        include: {
          usuario: {
            include: { rol: true },
          },
          detalles: {
            include: { platillo: true },
          },
        },
      });

      // Copiar detalles del pedido a la factura
      for (const detallePedido of pedido.detalles) {
        await tx.detalleFactura.create({
          data: {
            facturaId: factura.id,
            itemId: detallePedido.itemId,
            cantidad: detallePedido.cantidad,
            precioUnitario: detallePedido.precioUnitario,
            subtotal: detallePedido.subtotal,
            descripcionItem: detallePedido.platillo.nombreItem,
            notas: detallePedido.notasAdicionales,
            estado: 'ACTIVO',
          },
        });
      }

      this.auditoriaFactura(null, factura, 'INSERT');

      return factura;
    });
  }

  /**
   * Obtener facturas de un cliente
   * RF-04: Consulta de facturas por cliente
   */
  async obtenerFacturasCliente(usuarioCedula: string): Promise<any[]> {
    // Validar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { cedula: usuarioCedula },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con cédula ${usuarioCedula} no encontrado`);
    }

    return this.prisma.factura.findMany({
      where: {
        usuarioCedula,
        estado: 'ACTIVO',
      },
      include: {
        usuario: {
          include: { rol: true },
        },
        pedido: true,
        detalles: {
          include: { platillo: true },
        },
      },
      orderBy: { fechaFactura: 'desc' },
    });
  }

  /**
   * Obtener facturas por estado
   */
  async obtenerFacturasPorEstado(estado: string): Promise<any[]> {
    const estadosValidos = ['EMITIDA', 'PAGADA', 'ANULADA'];
    if (!estadosValidos.includes(estado)) {
      throw new BadRequestException(`Estado no válido. Usar: ${estadosValidos.join(', ')}`);
    }

    return this.prisma.factura.findMany({
      where: {
        estadoFactura: estado,
        estado: 'ACTIVO',
      },
      include: {
        usuario: { include: { rol: true } },
        pedido: true,
        detalles: { include: { platillo: true } },
      },
      orderBy: { fechaFactura: 'desc' },
    });
  }

  /**
   * Obtener una factura por ID
   */
  async obtenerFactura(id: number): Promise<any> {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: {
        usuario: { include: { rol: true } },
        pedido: true,
        detalles: { include: { platillo: true } },
      },
    });

    if (!factura) {
      throw new NotFoundException(`Factura ${id} no encontrada`);
    }

    return factura;
  }

  /**
   * Actualizar estado de factura
   */
  async actualizarEstadoFactura(id: number, input: UpdateFacturaInput): Promise<any> {
    const factura = await this.obtenerFactura(id);

    if (!factura) {
      throw new NotFoundException(`Factura ${id} no encontrada`);
    }

    const estadosValidos = ['EMITIDA', 'PAGADA', 'ANULADA'];
    if (input.estadoFactura && !estadosValidos.includes(input.estadoFactura)) {
      throw new BadRequestException(`Estado no válido. Usar: ${estadosValidos.join(', ')}`);
    }

    const facturaActualizada = await this.prisma.factura.update({
      where: { id },
      data: {
        estadoFactura: input.estadoFactura || factura.estadoFactura,
        descripcion: input.descripcion || factura.descripcion,
      },
      include: {
        usuario: { include: { rol: true } },
        pedido: true,
        detalles: { include: { platillo: true } },
      },
    });
    try {
      await this.auditoriaService.logAction(
        facturaActualizada.usuarioCedula,
        "UPDATE",
        'factura',
        facturaActualizada.id.toString(),
        { estadoFactura: factura.estadoFactura, descripcion: factura.descripcion },
        { estadoFactura: facturaActualizada.estadoFactura, descripcion: facturaActualizada.descripcion } 
      );
    } catch (error) {
      console.error('Error auditando factura:', error);
    }
    return facturaActualizada;
  }

  /**
   * Anular factura
   */
  async anularFactura(id: number): Promise<any> {
    const factura = await this.obtenerFactura(id);

    if (factura.estadoFactura === 'ANULADA') {
      throw new BadRequestException('Esta factura ya está anulada');
    }

    const facturaActualizada = await this.prisma.factura.update({
      where: { id },
      data: { estadoFactura: 'ANULADA' },
      include: {
        usuario: { include: { rol: true } },
        pedido: true,
        detalles: { include: { platillo: true } },
      },
    });

    try {
      await this.auditoriaService.logAction(
        facturaActualizada.usuarioCedula,
        "UPDATE",
        'factura',
        facturaActualizada.id.toString(),
        { estadoFactura: factura.estadoFactura },
        { estadoFactura: facturaActualizada.estadoFactura } 
      );
    } catch (error) {
      console.error('Error auditando factura:', error);
    }
    return facturaActualizada;
  }

  /**
   * Obtener todas las facturas (VENDEDOR y ADMINISTRADOR)
   * RF-04: Acceso ampliado para roles de poder
   */
  async obtenerTodasLasFacturas(): Promise<any[]> {
    return this.prisma.factura.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        usuario: { include: { rol: true } },
        pedido: true,
        detalles: { include: { platillo: true } },
      },
      orderBy: { fechaFactura: 'desc' },
    });
  }

  /**
   * Obtener facturas del mes actual
   */
  async obtenerFacturasDelMes(): Promise<any[]> {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

    return this.prisma.factura.findMany({
      where: {
        fechaFactura: {
          gte: inicioMes,
          lte: finMes,
        },
        estado: 'ACTIVO',
      },
      include: {
        usuario: { include: { rol: true } },
        pedido: true,
        detalles: { include: { platillo: true } },
      },
      orderBy: { fechaFactura: 'desc' },
    });
  }
}