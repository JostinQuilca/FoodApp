import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra una acción en la tabla de auditoría.
   * @param usuarioCedula - Cédula del usuario que realizó la acción.
   * @param tipoAccion - Tipo de operación (ej. 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'UPDATE_USUARIO').
   * @param nombreTabla - Nombre de la tabla afectada.
   * @param registroId - ID del registro afectado.
   * @param datosAnteriores - JSON con datos previos (opcional).
   * @param datosNuevos - JSON con datos nuevos (opcional).
   */
  async logAction(
    usuarioCedula: string,
    tipoAccion: string,
    nombreTabla: string,
    registroId: string,
    datosAnteriores: any = null,
    datosNuevos: any = null,
  ) {
    try {
      await this.prisma.auditoria.create({
        data: {
          usuarioCedula: usuarioCedula,          // ✔ coincide con tu schema
          tipoAccion: tipoAccion,                // ✔
          nombreTabla: nombreTabla,              // ✔
          registroId: registroId,                // ✔
          fechaHora: new Date(),                 // ✔ campo real en tu model
          datosAnteriores: datosAnteriores ?? null,  // JSONB
          datosNuevos: datosNuevos ?? null,          // JSONB
        },
      });
    } catch (error) {
      console.error(
        `ERROR registrando auditoría (${tipoAccion}) para ${usuarioCedula}:`,
        error,
      );
    }
  }

  /**
   * Devuelve todos los registros de auditoría, ordenados de más reciente a más antiguo.
   */
  async getAll() {
    return this.prisma.auditoria.findMany({
      orderBy: { fechaHora: 'desc' },
    });
  }
}
