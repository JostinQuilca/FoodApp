/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Clientes" (
    "cliente_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100),
    "telefono" VARCHAR(15),
    "email" VARCHAR(100) NOT NULL,
    "direccion_principal" TEXT NOT NULL,
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "Categorias_Menu" (
    "categoria_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Categorias_Menu_pkey" PRIMARY KEY ("categoria_id")
);

-- CreateTable
CREATE TABLE "Items_Menu" (
    "item_id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "nombre_item" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Items_Menu_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Pedidos" (
    "pedido_id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_pedido" VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    "tipo_entrega" VARCHAR(50) NOT NULL,
    "direccion_entrega" TEXT NOT NULL,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Pedidos_pkey" PRIMARY KEY ("pedido_id")
);

-- CreateTable
CREATE TABLE "Detalles_Pedido" (
    "detalle_id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notas_adicionales" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Detalles_Pedido_pkey" PRIMARY KEY ("detalle_id")
);

-- CreateTable
CREATE TABLE "Opciones_Item" (
    "opcion_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "nombre_opcion" VARCHAR(100) NOT NULL,
    "valor_opcion" VARCHAR(100) NOT NULL,
    "ajuste_precio" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Opciones_Item_pkey" PRIMARY KEY ("opcion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_telefono_key" ON "Clientes"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_email_key" ON "Clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categorias_Menu_nombre_key" ON "Categorias_Menu"("nombre");

-- AddForeignKey
ALTER TABLE "Items_Menu" ADD CONSTRAINT "Items_Menu_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categorias_Menu"("categoria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedidos" ADD CONSTRAINT "Pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalles_Pedido" ADD CONSTRAINT "Detalles_Pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "Pedidos"("pedido_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalles_Pedido" ADD CONSTRAINT "Detalles_Pedido_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Items_Menu"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opciones_Item" ADD CONSTRAINT "Opciones_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Items_Menu"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;
