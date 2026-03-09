-- Supabase PostgreSQL Schema for Gym-Gamer
-- This script relies on Supabase's built-in `auth.users` for authentication.

-- Drop existing tables if they exist to prevent conflicts from old versions
DROP TABLE IF EXISTS "VideoSubmissions" CASCADE;
DROP TABLE IF EXISTS "ProgramDetails" CASCADE;
DROP TABLE IF EXISTS "Programs" CASCADE;
DROP TABLE IF EXISTS "Workouts" CASCADE;
DROP TABLE IF EXISTS "Exercises" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS video_submissions CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table (Extended user data)
-- Triggered or inserted after a user signs up via Supabase Auth
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    account_type TEXT CHECK (account_type IN ('Standart', 'Rekabetçi')) DEFAULT 'Standart',
    elo_score INT DEFAULT 1000,
    rank_title TEXT DEFAULT 'Başlangıç',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Exercises Table (Global catalog)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_tr TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Göğüs', 'Sırt', 'Bacak'
    base_xp_multiplier FLOAT DEFAULT 1.0
);

-- 3. Workouts Table (A single session)
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    program_name TEXT NOT NULL, -- The program followed that day
    day_name TEXT NOT NULL,     -- The specific day name (e.g. 'Gün 1')
    total_volume FLOAT DEFAULT 0.0,
    elo_gained INT DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workout Logs Table (Granular sets & reps)
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL, -- SET NULL so logs remain even if exercise is deleted
    set_number INT NOT NULL,
    weight_kg FLOAT NOT NULL,
    reps INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Video Submissions (For 'Rekabetçi' users and coaches)
CREATE TABLE video_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    weight_kg FLOAT NOT NULL,
    reps INT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    coach_rating INT CHECK (coach_rating >= 1 AND coach_rating <= 10) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ NULL
);

-- Note: Ensure `uuid-ossp` extension is enabled in your database to use `uuid_generate_v4()`
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
