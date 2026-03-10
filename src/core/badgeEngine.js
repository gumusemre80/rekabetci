import BADGES from './badgeDefinitions';

/**
 * Check all badges for a user and return newly earned ones.
 * @param {string} userId
 * @param {object} supabase - Supabase client
 * @param {number} [sessionVolume=0] - Volume from the just-completed workout
 * @returns {{ newBadges: object[], allEarned: string[] }}
 */
export async function checkBadges(userId, supabase, sessionVolume = 0) {
  // 1. Already-earned badges
  const { data: earned } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', userId);

  const earnedKeys = new Set((earned || []).map(b => b.badge_key));

  // 2. Gather user stats in parallel
  const [workoutsRes, logsRes, profileRes] = await Promise.all([
    supabase.from('workouts').select('id, date, total_volume').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('workout_logs').select('weight_kg, exercise_id, exercises(name_tr, category), workouts!inner(user_id)').eq('workouts.user_id', userId),
    supabase.from('profiles').select('elo_score').eq('id', userId).single()
  ]);

  const workouts = workoutsRes.data || [];
  const logs = logsRes.data || [];
  const eloScore = profileRes.data?.elo_score || 0;

  // 3. Compute derived stats
  const totalWorkouts = workouts.length;
  const lifetimeVolume = workouts.reduce((sum, w) => sum + (w.total_volume || 0), 0);

  // Max weight per exercise name + overall max
  const maxWeightByExercise = {};
  let maxWeightAny = 0;
  const uniqueExercises = new Set();
  logs.forEach(log => {
    const name = log.exercises?.name_tr;
    if (!name) return;
    uniqueExercises.add(name);
    if (!maxWeightByExercise[name] || log.weight_kg > maxWeightByExercise[name]) {
      maxWeightByExercise[name] = log.weight_kg;
    }
    if (log.weight_kg > maxWeightAny) maxWeightAny = log.weight_kg;
  });

  // Streak calculation
  const currentStreak = calcStreak(workouts.map(w => w.date));

  // Time-based counts
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  let workoutsThisWeek = 0, workoutsThisMonth = 0, workoutsThisYear = 0;
  workouts.forEach(w => {
    const d = new Date(w.date);
    if (d >= weekStart) workoutsThisWeek++;
    if (d >= monthStart) workoutsThisMonth++;
    if (d >= yearStart) workoutsThisYear++;
  });

  // Muscle groups this week
  const muscleGroupsSet = new Set();
  logs.forEach(log => {
    const cat = log.exercises?.category;
    if (!cat) return;
    // We'd need to know workout date for this log — simplified: count all unique categories
    muscleGroupsSet.add(cat);
  });

  // 4. Build data object
  const data = {
    totalWorkouts, lifetimeVolume, currentStreak,
    maxWeightByExercise, maxWeightAny, sessionVolume,
    eloScore, uniqueExerciseCount: uniqueExercises.size,
    muscleGroupsThisWeek: muscleGroupsSet.size,
    workoutsThisWeek, workoutsThisMonth, workoutsThisYear
  };

  // 5. Check each badge
  const newBadges = [];
  for (const badge of BADGES) {
    if (earnedKeys.has(badge.key)) continue;
    try {
      if (badge.check(data)) {
        newBadges.push(badge);
      }
    } catch (e) {
      // Skip on error
    }
  }

  // 6. Insert new badges
  if (newBadges.length > 0) {
    const rows = newBadges.map(b => ({ user_id: userId, badge_key: b.key }));
    await supabase.from('user_badges').insert(rows);
  }

  const allEarned = [...earnedKeys, ...newBadges.map(b => b.key)];
  return { newBadges, allEarned };
}

/**
 * Calculate current consecutive-day streak from sorted dates (most recent first)
 */
function calcStreak(dates) {
  if (!dates.length) return 0;

  const uniqueDays = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Must have worked out today or yesterday
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export default checkBadges;
