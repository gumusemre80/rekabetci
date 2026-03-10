-- Add RPE column to workout_logs
-- Run this in Supabase SQL Editor

ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS rpe REAL;
