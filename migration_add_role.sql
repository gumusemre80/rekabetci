-- Migration: Add role column to profiles for RBAC
-- Run this SQL in the Supabase Dashboard SQL Editor

-- Add role column with default 'user'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator'));

-- To promote a user to moderator, run:
-- UPDATE profiles SET role = 'moderator' WHERE username = 'YOUR_USERNAME';
