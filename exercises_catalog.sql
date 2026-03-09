-- Gym Gamer Core Exercise Catalog
-- Run this in your Supabase SQL Editor to populate the 'exercises' table.

INSERT INTO public.exercises (name_tr, category, base_xp_multiplier) VALUES
-- Göğüs (Chest)
('Barbell Bench Press', 'Göğüs', 1.5),
('Incline Barbell Bench Press', 'Göğüs', 1.4),
('Dumbbell Bench Press', 'Göğüs', 1.2),
('Incline Dumbbell Press', 'Göğüs', 1.2),
('Decline Bench Press', 'Göğüs', 1.3),
('Push-up (Şınav)', 'Göğüs', 1.0),
('Dumbbell Flyes', 'Göğüs', 1.0),
('Cable Crossover', 'Göğüs', 1.1),
('Machine Chest Press', 'Göğüs', 1.1),
('Pec Deck Fly', 'Göğüs', 1.0),

-- Sırt (Back)
('Deadlift', 'Sırt', 2.0),
('Pull-up (Barfiks)', 'Sırt', 1.5),
('Lat Pulldown', 'Sırt', 1.2),
('Barbell Row', 'Sırt', 1.4),
('Dumbbell Row', 'Sırt', 1.2),
('Seated Cable Row', 'Sırt', 1.2),
('T-Bar Row', 'Sırt', 1.3),
('Face Pull', 'Sırt', 1.0),
('Straight Arm Pulldown', 'Sırt', 1.0),
('Good Morning', 'Sırt', 1.3),

-- Bacak (Legs)
('Barbell Back Squat', 'Bacak', 2.0),
('Front Squat', 'Bacak', 1.8),
('Leg Press', 'Bacak', 1.5),
('Romanian Deadlift (RDL)', 'Bacak', 1.6),
('Bulgarian Split Squat', 'Bacak', 1.4),
('Walking Lunges', 'Bacak', 1.2),
('Leg Extension', 'Bacak', 1.0),
('Lying Leg Curl', 'Bacak', 1.0),
('Seated Leg Curl', 'Bacak', 1.0),
('Standing Calf Raise', 'Bacak', 1.0),
('Seated Calf Raise', 'Bacak', 1.0),

-- Omuz (Shoulders)
('Overhead Press (OHP)', 'Omuz', 1.5),
('Dumbbell Shoulder Press', 'Omuz', 1.3),
('Lateral Raise', 'Omuz', 1.0),
('Front Raise', 'Omuz', 1.0),
('Reverse Pec Deck', 'Omuz', 1.0),
('Upright Row', 'Omuz', 1.2),
('Arnold Press', 'Omuz', 1.3),

-- Kollar (Arms)
('Barbell Biceps Curl', 'Kollar', 1.1),
('Dumbbell Biceps Curl', 'Kollar', 1.0),
('Hammer Curl', 'Kollar', 1.0),
('Preacher Curl', 'Kollar', 1.0),
('Cable Biceps Curl', 'Kollar', 1.0),
('Triceps Pushdown', 'Kollar', 1.0),
('Overhead Triceps Extension', 'Kollar', 1.0),
('Skullcrusher', 'Kollar', 1.2),
('Close-Grip Bench Press', 'Kollar', 1.3),
('Triceps Dips', 'Kollar', 1.2),

-- Core / Karın (Abs)
('Crunch', 'Karın', 1.0),
('Plank', 'Karın', 1.0), -- Note: reps might represent seconds here, or weight=0
('Hanging Leg Raise', 'Karın', 1.2),
('Cable Crunch', 'Karın', 1.1),
('Russian Twist', 'Karın', 1.0),
('Ab Wheel Rollout', 'Karın', 1.3)
ON CONFLICT DO NOTHING; -- Prevents errors if rerun

-- Check the inserted counts
-- SELECT count(*) FROM public.exercises;
