-- ============================================================================
-- SCRIPT DE MIGRACIÓN PARA AGREGAR MÓDULO DE FACTURACIÓN
-- ============================================================================

-- 1. AGREGAR ROLES FALTANTES (SUPERVISOR y VENDEDOR)
-- ============================================================================
INSERT INTO public.roles (nombre_rol, estado) 
VALUES 
  ('SUPERVISOR', 'ACTIVO'),
  ('VENDEDOR', 'ACTIVO')
ON CONFLICT (nombre_rol) DO NOTHING;


-- 2. CREAR TABLA FACTURA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.factura (
    factura_id SERIAL PRIMARY KEY,
    usuario_cedula VARCHAR(10) NOT NULL,
    pedido_id INTEGER,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    fecha_factura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    monto_subtotal DECIMAL(10, 2) NOT NULL,
    monto_iva DECIMAL(10, 2) DEFAULT 0.00,
    monto_total DECIMAL(10, 2) NOT NULL,
    estado_factura VARCHAR(50) DEFAULT 'EMITIDA' NOT NULL, -- EMITIDA, PAGADA, ANULADA
    tipo_factura VARCHAR(50) DEFAULT 'VENTA' NOT NULL, -- VENTA (directa) o PEDIDO (automática)
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL,
    
    -- CONSTRAINT: Un pedido solo puede tener una factura
    UNIQUE(pedido_id),
    
    -- Foreign Keys
    CONSTRAINT fk_factura_usuario FOREIGN KEY (usuario_cedula) 
        REFERENCES public.usuarios(cedula) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_factura_pedido FOREIGN KEY (pedido_id) 
        REFERENCES public.pedidos(pedido_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_factura_usuario ON public.factura(usuario_cedula);
CREATE INDEX idx_factura_pedido ON public.factura(pedido_id);
CREATE INDEX idx_factura_estado ON public.factura(estado_factura);
CREATE INDEX idx_factura_tipo ON public.factura(tipo_factura);
CREATE INDEX idx_factura_fecha ON public.factura(fecha_factura);


-- 3. CREAR TABLA DETALLE_FACTURA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.detalle_factura (
    detalle_factura_id SERIAL PRIMARY KEY,
    factura_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    descripcion_item TEXT,
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_detalle_factura_factura FOREIGN KEY (factura_id) 
        REFERENCES public.factura(factura_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_factura_item FOREIGN KEY (item_id) 
        REFERENCES public.platillos(item_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Crear índices
CREATE INDEX idx_detalle_factura_factura ON public.detalle_factura(factura_id);
CREATE INDEX idx_detalle_factura_item ON public.detalle_factura(item_id);


-- 4. CREAR TABLA DE AUDITORÍA PARA FACTURACIÓN (opcional, pero recomendado)
-- ============================================================================
-- La tabla auditoria existente ya captura cambios, pero puedes agregar eventos específicos aquí
-- Por ahora, usaremos la auditoria existente


-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
-- Ejecutar este script en tu base de datos PostgreSQL
-- Luego actualizar schema.prisma y ejecutar: npx prisma migrate dev
