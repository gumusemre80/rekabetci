-- Rozetler (Badges) Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
