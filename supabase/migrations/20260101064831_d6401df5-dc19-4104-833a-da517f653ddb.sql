-- First, check if 'moderator' exists in the enum and add if not
-- We need to recreate the type since PostgreSQL doesn't have ALTER TYPE ADD IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'moderator' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'moderator';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure we have 'user' role too
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'user';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;