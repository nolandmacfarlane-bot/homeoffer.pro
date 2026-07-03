-- Migration: Add sms_opt_in column to users table
-- Purpose: Track SMS opt-in status for TCPA compliance
-- Date: July 3, 2026

-- Step 1: Add sms_opt_in column
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT FALSE;

-- Step 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_sms_opt_in ON users(sms_opt_in);

-- Step 3: Verify
-- SELECT id, email, sms_opt_in FROM users LIMIT 5;
