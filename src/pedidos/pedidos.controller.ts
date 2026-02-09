import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoInput } from './dto/create-pedido.input';
import { UpdatePedidoInput } from './dto/update-pedido.input';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

/**
 * Controlador REST para Pedidos
 * Requisito RF-05: Endpoints REST para consulta de pedidos
 */
@Controller('api/pedidos')
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  /**
   * POST /api/pedidos
   * Crear un nuevo pedido
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async crearPedido(@Body() input: CreatePedidoInput, @Req() req: any) {
    try {
      return await this.pedidosService.create(input);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /api/pedidos/mis-pedidos
   * Obtener pedidos del cliente autenticado
   * RF-05: Consulta de pedidos por cliente
   */
  @Get('mis-pedidos')
  @UseGuards(JwtAuthGuard)
  async misPedidos(@Req() req: any) {
    try {
      const usuarioCedula = req.user?.cedula;
      if (!usuarioCedula) {
        throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
      }
      const todos = await this.pedidosService.findAll();
      // Filtrar solo los pedidos del usuario autenticado
      return todos.filter((pedido: any) => pedido.usuarioCedula === usuarioCedula);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /api/pedidos
   * Obtener todos los pedidos (solo ADMINISTRADOR)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async obtenerTodos(@Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('Solo ADMINISTRADOR puede ver todos los pedidos', HttpStatus.FORBIDDEN);
      }
      return await this.pedidosService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /api/pedidos/:id
   * Obtener un pedido por ID (solo propietario o admin)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async obtenerPedido(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      const pedido = await this.pedidosService.findOne(id);
      if (!pedido) {
        throw new HttpException('Pedido no encontrado', HttpStatus.NOT_FOUND);
      }

      const usuarioCedula = req.user?.cedula;
      const usuarioRol = req.user?.rol?.nombre;

      // Validar acceso: solo propietario o admin pueden ver
      if (pedido.usuarioCedula !== usuarioCedula && usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('No tiene permiso para ver este pedido', HttpStatus.FORBIDDEN);
      }

      return pedido;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * PUT /api/pedidos/:id
   * Actualizar un pedido (solo propietario o admin)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async actualizarPedido(@Param('id', ParseIntPipe) id: number, @Body() input: UpdatePedidoInput, @Req() req: any) {
    try {
      const pedido = await this.pedidosService.findOne(id);
      if (!pedido) {
        throw new HttpException('Pedido no encontrado', HttpStatus.NOT_FOUND);
      }

      const usuarioCedula = req.user?.cedula;
      const usuarioRol = req.user?.rol?.nombre;

      // Validar acceso
      if (pedido.usuarioCedula !== usuarioCedula && usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('No tiene permiso para actualizar este pedido', HttpStatus.FORBIDDEN);
      }

      return await this.pedidosService.update(id, input);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DELETE /api/pedidos/:id
   * Eliminar un pedido (solo ADMINISTRADOR)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async eliminarPedido(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      const usuarioRol = req.user?.rol?.nombre;
      if (usuarioRol !== 'ADMINISTRADOR') {
        throw new HttpException('Solo ADMINISTRADOR puede eliminar pedidos', HttpStatus.FORBIDDEN);
      }

      const pedido = await this.pedidosService.findOne(id);
      if (!pedido) {
        throw new HttpException('Pedido no encontrado', HttpStatus.NOT_FOUND);
      }

      return await this.pedidosService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
