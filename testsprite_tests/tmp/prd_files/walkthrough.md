# Gym-Gamer: Project Journey & Current State

This document serves as a "save point" and high-level summary of everything built in the **Rekabetçi (Gym-Gamer)** application.

## 🏆 Core Foundation Built
We established a modern, gamified fitness tracking application utilizing **React (Vite)** and **Supabase (PostgreSQL)**. 

### 1. The Database (Supabase)
- **Profiles Table:** Tracks user usernames, Account Types (Standart/Pro), and their raw `elo_score`.
- **Exercises Catalog:** A relational table listing all valid exercises (e.g., Squat, Bench Press) to enforce consistency.
- **Workouts & Logs:** Every workout session is saved referencing a specific program day, while `workout_logs` stores the individual granular inputs (sets, reps, weights) linked to specific exercises.
- **Security:** We implemented Row Level Security (RLS) across all tables to ensure users can only ever see or modify their own data securely.

### 2. Gamification Engine (Core Javascript logic)
- **eloCalculator.js:** Core mechanic parsing sets/reps into a `total_volume` metric. Every 100 volume grants +1 ELO score. 
- **Rank Thresholds:** Users visually rank up (Başlangıç → Bronz → Gümüş → Altın vs) automatically based on ELO score targets.
- **analysisEngine.js:** Provides dynamic motivational feedback (Praises and Suggestions) based on user effort tracking (RPE) and volume.

---

## 🏗️ Architectural Refactoring (Today's Update)
As the app grew, some components became extremely heavy and hard to manage. We performed a major **Route 1 Refactor** to clean up the architecture for scalability.

### Before: Prop Drilling
`App.jsx` was handling everything: maintaining the user's session, fetching all the database logs, and passing data artificially down through multiple layers of components to reach the `Profile` or `WorkoutLogger`.

### After: Context & Hooks (Modularity)
1. **AuthContext (`src/context/AuthContext.jsx`):** We extracted user authentication into a global Context provider. Now, any component in the app can simply call `useAuth()` to get the current `user`, `session`, `eloScore`, and `rankTitle` instantly.
2. **Data Hook (`src/hooks/useUserData.js`):** We built a custom hook to specifically handle the complex fetching logic for the activity logs, so that components like the Profile or Workout Logger can request the workout history autonomously.
3. **Component Extractions:** 
   - Ripped the heavy calendar logic out of `Profile.jsx` into a standalone `<ActivityHeatmap />`.
   - Extracted the visual ranking UI into a standalone `<RankCard />`.

> [!NOTE] 
> As of this refactor, `App.jsx` is now purely an orchestrator for navigating the visual tabs, ensuring future features can be built safely without breaking global connections.

---

## 🚀 Next Steps / Current Objective
Now that the architecture is modular and we have successfully integrated the **Testsprite AI Testing Engine** (and bypassed the Windows execution policies blocking it), our immediate next goal is to utilize Testsprite to:
1. Generate test plans for our core logic (`useUserData` and `eloCalculator`).
2. Run automated tests to prove that our data fetching and ranking logic works flawlessly before we proceed to build new features like a unified caching layer or advanced Leaderboarding!
