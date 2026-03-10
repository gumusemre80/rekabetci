-- Migration: Add user_programs table for persistent program storage
-- Run this SQL in the Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS user_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    program_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own programs
CREATE POLICY "Users can manage own programs."
  ON user_programs FOR ALL USING (auth.uid() = user_id);
