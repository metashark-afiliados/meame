-- scripts/supabase/migrations/YYYYMMDDHHMMSS_create_commerce_orders_table.sql
-- (Reemplaza YYYYMMDDHHMMSS con la marca de tiempo actual, ej. 20250928063000)

-- Habilitar la extensión uuid-ossp si aún no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: commerce_orders
-- Almacena las órdenes de compra.
CREATE TABLE public.commerce_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_payment_intent_id text NOT NULL UNIQUE, -- Identificador único de Stripe Payment Intent
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional, para compras de invitados
  amount numeric(10, 2) NOT NULL, -- Total de la orden con 2 decimales
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  customer_email text NOT NULL,
  items jsonb NOT NULL, -- JSONB para almacenar el array de OrderItemSchema
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_commerce_orders_user_id ON public.commerce_orders (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_commerce_orders_payment_intent ON public.commerce_orders (stripe_payment_intent_id);
CREATE INDEX idx_commerce_orders_status ON public.commerce_orders (status);
CREATE INDEX idx_commerce_orders_created_at ON public.commerce_orders (created_at DESC);


-- Habilitar Row Level Security (RLS)
ALTER TABLE public.commerce_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para commerce_orders

-- Política de lectura: Los usuarios pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
ON public.commerce_orders
FOR SELECT
USING (auth.uid() = user_id); -- Solo si user_id está presente

-- Política de inserción: Permitir la inserción desde el service_role (webhooks) o usuario autenticado
CREATE POLICY "Service and authenticated users can insert orders"
ON public.commerce_orders
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Política de actualización: Permitir actualizaciones solo desde el service_role (webhooks para actualizar status)
CREATE POLICY "Service can update orders"
ON public.commerce_orders
FOR UPDATE
USING (auth.role() = 'service_role');

-- Política de eliminación: Restringir la eliminación para mantener el historial
CREATE POLICY "No one can delete orders"
ON public.commerce_orders
FOR DELETE
USING (FALSE);
