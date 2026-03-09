-- Row Level Security (RLS) and Triggers Setup

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
-- Everyone can read profiles (for leaderboards)
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);

-- Users can only insert/update their own profile
CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Exercises Policies
-- Everyone can view available exercises
CREATE POLICY "Exercises are viewable by everyone." 
  ON exercises FOR SELECT USING (true);

-- 4. Workouts Policies
-- Users can completely manage (CRUD) their own workouts
CREATE POLICY "Users can manage their own workouts." 
  ON workouts FOR ALL USING (auth.uid() = user_id);

-- 5. Workout Logs Policies
-- Users can manage logs for workouts they own
CREATE POLICY "Users can read/update/delete their own workout logs." 
  ON workout_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_logs.workout_id AND workouts.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own workout logs." 
  ON workout_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_id AND workouts.user_id = auth.uid())
  );

CREATE POLICY "Users can update/delete their own workout logs." 
  ON workout_logs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_logs.workout_id AND workouts.user_id = auth.uid())
  );
  
CREATE POLICY "Users can delete their own workout logs." 
  ON workout_logs FOR DELETE USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_logs.workout_id AND workouts.user_id = auth.uid())
  );

-- 6. Video Submissions Policies
-- Everyone can view (for the coach panel) but users manage their own
CREATE POLICY "Video submissions viewable by everyone." 
  ON video_submissions FOR SELECT USING (true);

CREATE POLICY "Users can manage own video submissions." 
  ON video_submissions FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 7. TRIGGER: Auto-create Profile on Sign Up
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, account_type)
  VALUES (
    new.id, 
    split_part(new.email, '@', 1), -- Defaults username to email prefix (e.g., 'emre' from 'emre@gmail.com')
    'Standart'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
