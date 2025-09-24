-- Migration: create table_usage_history
-- Run with:
-- psql "postgres://<user>:<pass>@<host>:<port>/<db>" -f backend/migrations/20250918_create_table_usage_history.sql

CREATE TABLE IF NOT EXISTS table_usage_history (
  usage_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL,
  order_id uuid,
  customer_name varchar(100),
  customer_phone varchar(20),
  guest_count integer NOT NULL DEFAULT 1,
  start_time timestamp NOT NULL,
  end_time timestamp,
  duration_minutes integer,
  total_order_amount numeric(12,2) DEFAULT 0,
  total_payment_amount numeric(12,2) DEFAULT 0,
  usage_type varchar(50),
  notes text,
  waiter_assigned varchar(100),
  order_placed_at timestamp,
  food_served_at timestamp,
  payment_completed_at timestamp,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_table_usage_history_table_id ON table_usage_history(table_id);
CREATE INDEX IF NOT EXISTS idx_table_usage_history_start_time ON table_usage_history(start_time);
CREATE INDEX IF NOT EXISTS idx_table_usage_history_end_time ON table_usage_history(end_time);

-- Foreign key to tables (ensure parent table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tables') THEN
    ALTER TABLE table_usage_history
      ADD CONSTRAINT fk_table_usage_history_table
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE;
  END IF;
END$$;
