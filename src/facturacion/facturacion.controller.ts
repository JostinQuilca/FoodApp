import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { CreateFacturaInput } from './dto/create-factura.input';
import { UpdateFacturaInput } from './dto/update-factura.input';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

/**
 * Controlador REST para Facturación
 * Requisito RF-04 y RF-05: Endpoints REST para consulta
 */
@Controller('api/facturacion')
export class FacturacionController {
  constructor(private facturacionService: FacturacionService) {}

  /**
   * POST /api/facturacion/crear-directa
   * Crear factura directa (solo VENDEDOR - RESTRICCIÓN ESTRICTA)
   * RF-02: Facturación directa
   */
  @Post('crear-directa')
  @UseGuards(JwtAuthGuard)
  async crearFacturaDirecta(@Body() input: CreateFacturaInput, @Req() req: any) {
    try {
      const usuarioCedula = req.user?.cedula;
      const usuarioRol = req.user?.rol?.nombre;
      // Validación estricta: solo VENDEDOR
      if (usuarioRol !== 'VENDEDOR') {
        throw new HttpException('Solo VENDEDOR puede crear facturas directas', HttpStatus.FORBIDDEN);
      }
      return await this.facturacionService.crearFacturaDirecta(usuarioCedula, input);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /api/facturacion/mis-facturas
   * Obtener facturas del cliente autenticado
   * RF-03 y RF-04: Consulta de facturas
   */
  @Get('mis-facturas')
  @UseGuards(JwtAuthGuard)
async misFacturas(@Req() req: any) {
  const usuarioCedula = req.user?.cedula;
  return await this.facturacionService.obtenerFacturasCliente(usuarioCedula);
}

  /**
   * GET /api/facturacion
   * Obtener todas las facturas (VENDEDOR y ADMINISTRADOR)
   * RF-04: Acceso ampliado para roles de poder
   */
  @Get('')
  @UseGuards(JwtAuthGuard)
  async obtenerTodasLasFacturas(@Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (!['ADMINISTRADOR', 'VENDEDOR'].includes(usuarioRol)) {
        throw new HttpException('Solo ADMINISTRADOR y VENDEDOR pueden ver todas las facturas', HttpStatus.FORBIDDEN);
      }
      return await this.facturacionService.obtenerTodasLasFacturas();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /api/facturacion/id/:id
   * Obtener factura por ID (propietario, VENDEDOR o ADMINISTRADOR)
   */
  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  async obtenerFactura(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      const factura = await this.facturacionService.obtenerFactura(id);
      const usuarioCedula = req.user?.cedula;
      const usuarioRol = req.user?.rol?.nombre;

      // Validar acceso: propietario, VENDEDOR o ADMINISTRADOR
      if (factura.usuarioCedula !== usuarioCedula && !['ADMINISTRADOR', 'VENDEDOR'].includes(usuarioRol)) {
        throw new HttpException('No tiene permiso para ver esta factura', HttpStatus.FORBIDDEN);
      }

      return factura;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /api/facturacion/estado/:estado
   * Obtener facturas por estado (solo ADMINISTRADOR)
   */
  @Get('estado/:estado')
  @UseGuards(JwtAuthGuard)
  async facturasPorEstado(@Param('estado') estado: string, @Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('Solo ADMINISTRADOR puede filtrar facturas por estado', HttpStatus.FORBIDDEN);
      }
      return await this.facturacionService.obtenerFacturasPorEstado(estado);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * PUT /api/facturacion/:id
   * Actualizar estado de factura
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async actualizarFactura(@Param('id') id: number, @Body() input: UpdateFacturaInput, @Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (!['ADMINISTRADOR', 'VENDEDOR'].includes(usuarioRol)) {
        throw new HttpException('No tiene permiso para actualizar facturas', HttpStatus.FORBIDDEN);
      }
      return await this.facturacionService.actualizarEstadoFactura(id, input);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DELETE /api/facturacion/:id
   * Anular factura (solo ADMINISTRADOR)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async anularFactura(@Param('id') id: number, @Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('Solo ADMINISTRADOR puede anular facturas', HttpStatus.FORBIDDEN);
      }
      return await this.facturacionService.anularFactura(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /api/facturacion/reportes/mes
   * Obtener facturas del mes actual (solo ADMINISTRADOR)
   */
  @Get('reportes/mes')
  @UseGuards(JwtAuthGuard)
  async facturasDelMes(@Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('Solo ADMINISTRADOR puede ver reportes', HttpStatus.FORBIDDEN);
      }
      return await this.facturacionService.obtenerFacturasDelMes();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
