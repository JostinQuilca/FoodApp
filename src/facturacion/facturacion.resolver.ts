import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { FacturacionService } from './facturacion.service';
import { Factura } from './entities/factura.entity';
import { CreateFacturaInput } from './dto/create-factura.input';
import { UpdateFacturaInput } from './dto/update-factura.input';

@Resolver(() => Factura)
export class FacturacionResolver {
  constructor(private facturacionService: FacturacionService) {}

  /**
   * Crear factura directa (solo VENDEDOR o ADMINISTRADOR)
   * RF-02: Facturación directa
   */
  @Mutation(() => Factura)
  @UseGuards(JwtAuthGuard)
  async crearFacturaDirecta(
    @Args('input') input: CreateFacturaInput,
    @Context() ctx: any,
  ): Promise<Factura> {
    const usuarioCedula = ctx.req.user?.cedula;
    return this.facturacionService.crearFacturaDirecta(usuarioCedula, input);
  }

  /**
   * Generar factura automáticamente desde pedido
   * (Solo para uso interno, no exponer vía GraphQL publicamente)
   */
  async generarFacturaDesdeoPedido(pedidoId: number): Promise<Factura> {
    return this.facturacionService.generarFacturaDesdeoPedido(pedidoId);
  }

  /**
   * Obtener facturas del cliente autenticado
   * RF-03 y RF-04: Consulta de facturas por cliente
   */
  @Query(() => [Factura])
  @UseGuards(JwtAuthGuard)
  async misFacturas(@Context() ctx: any): Promise<Factura[]> {
    const usuarioCedula = ctx.req.user?.cedula;
    return this.facturacionService.obtenerFacturasCliente(usuarioCedula);
  }

  /**
   * Obtener todas las facturas (solo ADMINISTRADOR)
   */
  @Query(() => [Factura])
  @UseGuards(JwtAuthGuard)
  async todasLasFacturas(@Context() ctx: any): Promise<Factura[]> {
    const usuarioRol = ctx.req.user?.rol?.nombre;
    if (usuarioRol !== 'ADMINISTRADOR') {
      throw new Error('Solo ADMINISTRADOR puede ver todas las facturas');
    }
    return this.facturacionService.obtenerFacturasDelMes();
  }

  /**
   * Obtener factura por ID
   */
  @Query(() => Factura, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async obtenerFactura(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any,
  ): Promise<Factura> {
    // Validar que el usuario sea dueño o admin
    const factura = await this.facturacionService.obtenerFactura(id);
    const usuarioCedula = ctx.req.user?.cedula;
    const usuarioRol = ctx.req.user?.rol?.nombre;

    if (factura.usuarioCedula !== usuarioCedula && usuarioRol !== 'ADMINISTRADOR') {
      throw new Error('No tiene permiso para ver esta factura');
    }

    return factura;
  }

  /**
   * Obtener facturas por estado
   */
  @Query(() => [Factura])
  @UseGuards(JwtAuthGuard)
  async facturasPorEstado(
    @Args('estado') estado: string,
    @Context() ctx: any,
  ): Promise<Factura[]> {
    // Solo ADMINISTRADOR puede filtrar por estado
    const usuarioRol = ctx.req.user?.rol?.nombre;
    if (usuarioRol !== 'ADMINISTRADOR') {
      throw new Error('Solo ADMINISTRADOR puede filtrar facturas por estado');
    }
    return this.facturacionService.obtenerFacturasPorEstado(estado);
  }

  /**
   * Actualizar estado de factura
   */
  @Mutation(() => Factura)
  @UseGuards(JwtAuthGuard)
  async actualizarEstadoFactura(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateFacturaInput,
    @Context() ctx: any,
  ): Promise<Factura> {
    // Solo ADMINISTRADOR o VENDEDOR pueden actualizar
    const usuarioRol = ctx.req.user?.rol?.nombre;
    if (!['ADMINISTRADOR', 'VENDEDOR'].includes(usuarioRol)) {
      throw new Error('No tiene permiso para actualizar facturas');
    }
    return this.facturacionService.actualizarEstadoFactura(id, input);
  }

  /**
   * Anular factura
   */
  @Mutation(() => Factura)
  @UseGuards(JwtAuthGuard)
  async anularFactura(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any,
  ): Promise<Factura> {
    // Solo ADMINISTRADOR puede anular
    const usuarioRol = ctx.req.user?.rol?.nombre;
    if (usuarioRol !== 'ADMINISTRADOR') {
      throw new Error('Solo ADMINISTRADOR puede anular facturas');
    }
    return this.facturacionService.anularFactura(id);
  }

  /**
   * Obtener facturas del mes actual
   */
  @Query(() => [Factura])
  @UseGuards(JwtAuthGuard)
  async facturasDelMes(@Context() ctx: any): Promise<Factura[]> {
    const usuarioRol = ctx.req.user?.rol?.nombre;
    if (usuarioRol !== 'ADMINISTRADOR') {
      throw new Error('Solo ADMINISTRADOR puede ver facturas del mes');
    }
    return this.facturacionService.obtenerFacturasDelMes();
  }
}
