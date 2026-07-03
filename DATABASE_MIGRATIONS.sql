-- Migration: Add buyer_agent_id to offers table
-- Purpose: Track which buyer's agent (if any) represents each buyer
-- Date: July 3, 2026

-- Step 1: Add buyer_agent_id column to offers table
ALTER TABLE offers ADD COLUMN buyer_agent_id UUID NULL;

-- Step 2: Create foreign key constraint
ALTER TABLE offers ADD CONSTRAINT fk_offers_buyer_agent_id 
FOREIGN KEY (buyer_agent_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Add index for performance
CREATE INDEX idx_offers_buyer_agent_id ON offers(buyer_agent_id);

-- Step 4: Add agent_represents field to users (tracks if user is an agent)
-- (Already exists - user_type field handles this)

-- Step 5: Add buyer's agent association in users (optional - for quick lookup)
ALTER TABLE users ADD COLUMN agent_id UUID NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_agent_id 
FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 6: Create index for agent lookups
CREATE INDEX idx_users_agent_id ON users(agent_id);

-- Verification queries:
-- SELECT * FROM offers WHERE buyer_agent_id IS NOT NULL;
-- SELECT * FROM users WHERE agent_id IS NOT NULL;
