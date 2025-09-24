-- Migration: make qr_codes.table_id FK use ON DELETE CASCADE
-- This migration attempts to remove any foreign key constraint from qr_codes.table_id
-- that references tables(id), then recreates it with ON DELETE CASCADE.

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT con.constraint_name INTO fk_name
  FROM information_schema.table_constraints con
  JOIN information_schema.key_column_usage kcu
    ON con.constraint_name = kcu.constraint_name
  WHERE con.table_schema = 'public'
    AND con.table_name = 'qr_codes'
    AND con.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'table_id'
    AND EXISTS (
      SELECT 1 FROM information_schema.referential_constraints rc
      JOIN information_schema.table_constraints tc ON rc.unique_constraint_name = tc.constraint_name
      WHERE rc.constraint_name = con.constraint_name
        AND tc.table_name = 'tables'
    )
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.qr_codes DROP CONSTRAINT %I;', fk_name);
  END IF;

  -- Recreate constraint with ON DELETE CASCADE
  BEGIN
    EXECUTE 'ALTER TABLE public.qr_codes ADD CONSTRAINT qr_codes_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE CASCADE;';
  EXCEPTION WHEN OTHERS THEN
    -- ignore if already exists or fails
    RAISE NOTICE 'Could not add constraint: %', SQLERRM;
  END;
END$$;

-- Note: run this using psql connected to your database, for example:
-- psql "postgres://user:password@localhost:5432/dbname" -f backend/migrations/20250917_add_cascade_qrcodes.sql
