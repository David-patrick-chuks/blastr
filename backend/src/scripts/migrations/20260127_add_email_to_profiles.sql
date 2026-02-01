-- Migration: Add email column to profiles table
-- Date: 2026-01-27

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
    END IF;
END $$;
