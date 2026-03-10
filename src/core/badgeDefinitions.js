/**
 * Badge Definitions — 28 badges across 6 categories
 * Each badge has: key, name, emoji, description, category, check(data) → boolean
 *
 * data shape passed to check():
 * {
 *   totalWorkouts, lifetimeVolume, currentStreak,
 *   maxWeightByExercise: { 'Barbell Bench Press': 100, ... },
 *   maxWeightAny, sessionVolume, eloScore,
 *   uniqueExerciseCount, muscleGroupsThisWeek,
 *   workoutsThisWeek, workoutsThisMonth, workoutsThisYear
 * }
 */

const BADGES = [
  // ═══ 💪 GÜÇ (Strength) ═══
  {
    key: 'first_workout', name: 'İlk Adım', emoji: '👣',
    description: 'İlk antrenmanını tamamla',
    category: 'Güç',
    check: (d) => d.totalWorkouts >= 1
  },
  {
    key: 'lift_40', name: 'Çaylak Kaldırıcı', emoji: '🪶',
    description: 'Herhangi bir harekette 40kg kaldır',
    category: 'Güç',
    check: (d) => d.maxWeightAny >= 40
  },
  {
    key: 'lift_100', name: 'Ağır Topçu', emoji: '💣',
    description: 'Herhangi bir harekette 100kg kaldır',
    category: 'Güç',
    check: (d) => d.maxWeightAny >= 100
  },
  {
    key: 'bench_100', name: 'Demir Yumruk', emoji: '🥊',
    description: 'Bench Press\'te 100kg kaldır',
    category: 'Güç',
    check: (d) => (d.maxWeightByExercise['Barbell Bench Press'] || 0) >= 100
  },
  {
    key: 'deadlift_140', name: 'Çelik Sırt', emoji: '⛓️',
    description: 'Deadlift\'te 140kg kaldır',
    category: 'Güç',
    check: (d) => (d.maxWeightByExercise['Deadlift'] || 0) >= 140
  },
  {
    key: 'squat_120', name: 'Bacak Canavarı', emoji: '🦵',
    description: 'Squat\'ta 120kg kaldır',
    category: 'Güç',
    check: (d) => (d.maxWeightByExercise['Barbell Back Squat'] || 0) >= 120
  },
  {
    key: 'lift_200', name: '200 Kulübü', emoji: '🏆',
    description: 'Herhangi bir harekette 200kg kaldır',
    category: 'Güç',
    check: (d) => d.maxWeightAny >= 200
  },

  // ═══ 🔥 SERİ (Streak) ═══
  {
    key: 'streak_7', name: 'Alışkanlık', emoji: '🌱',
    description: '7 gün üst üste antrenman yap',
    category: 'Seri',
    check: (d) => d.currentStreak >= 7
  },
  {
    key: 'streak_14', name: 'Disiplin', emoji: '🔥',
    description: '14 gün üst üste antrenman yap',
    category: 'Seri',
    check: (d) => d.currentStreak >= 14
  },
  {
    key: 'streak_30', name: 'Demir İrade', emoji: '💎',
    description: '30 gün üst üste antrenman yap',
    category: 'Seri',
    check: (d) => d.currentStreak >= 30
  },
  {
    key: 'streak_100', name: 'Efsane', emoji: '👑',
    description: '100 gün üst üste antrenman yap',
    category: 'Seri',
    check: (d) => d.currentStreak >= 100
  },

  // ═══ 📊 HACİM (Volume) ═══
  {
    key: 'session_10k', name: 'Ton Kulübü', emoji: '🧱',
    description: 'Tek seansta 10.000kg toplam hacim',
    category: 'Hacim',
    check: (d) => d.sessionVolume >= 10000
  },
  {
    key: 'session_20k', name: 'Kargo Gemisi', emoji: '🚢',
    description: 'Tek seansta 20.000kg toplam hacim',
    category: 'Hacim',
    check: (d) => d.sessionVolume >= 20000
  },
  {
    key: 'lifetime_100k', name: 'Hacim Kralı', emoji: '🏰',
    description: 'Toplam 100.000kg lifetime hacim',
    category: 'Hacim',
    check: (d) => d.lifetimeVolume >= 100000
  },
  {
    key: 'lifetime_1m', name: 'Milyon Kulübü', emoji: '🌟',
    description: 'Toplam 1.000.000kg lifetime hacim',
    category: 'Hacim',
    check: (d) => d.lifetimeVolume >= 1000000
  },

  // ═══ 🎮 ELO ═══
  {
    key: 'elo_1200', name: 'Bronz Lig', emoji: '🥉',
    description: '1200 ELO\'ya ulaş',
    category: 'ELO',
    check: (d) => d.eloScore >= 1200
  },
  {
    key: 'elo_1500', name: 'Gümüş Lig', emoji: '🥈',
    description: '1500 ELO\'ya ulaş',
    category: 'ELO',
    check: (d) => d.eloScore >= 1500
  },
  {
    key: 'elo_2000', name: 'Altın Lig', emoji: '🥇',
    description: '2000 ELO\'ya ulaş',
    category: 'ELO',
    check: (d) => d.eloScore >= 2000
  },
  {
    key: 'elo_2500', name: 'Elmas Lig', emoji: '💠',
    description: '2500 ELO\'ya ulaş',
    category: 'ELO',
    check: (d) => d.eloScore >= 2500
  },

  // ═══ 💪 ÇEŞİTLİLİK (Variety) ═══
  {
    key: 'balanced_5', name: 'Dengeli Vücut', emoji: '⚖️',
    description: '5 farklı kas grubunu aynı haftada çalıştır',
    category: 'Çeşitlilik',
    check: (d) => d.muscleGroupsThisWeek >= 5
  },
  {
    key: 'exercises_20', name: 'Hareket Ustası', emoji: '🎯',
    description: '20 farklı hareket dene',
    category: 'Çeşitlilik',
    check: (d) => d.uniqueExerciseCount >= 20
  },
  {
    key: 'exercises_40', name: 'Keşifçi', emoji: '🧭',
    description: '40 farklı hareket dene',
    category: 'Çeşitlilik',
    check: (d) => d.uniqueExerciseCount >= 40
  },

  // ═══ 📅 TUTARLILIK (Consistency) ═══
  {
    key: 'weekly_4', name: 'Haftanın Yıldızı', emoji: '⭐',
    description: 'Haftada 4+ antrenman yap',
    category: 'Tutarlılık',
    check: (d) => d.workoutsThisWeek >= 4
  },
  {
    key: 'monthly_16', name: 'Aylık Savaşçı', emoji: '⚔️',
    description: 'Ayda 16+ antrenman yap',
    category: 'Tutarlılık',
    check: (d) => d.workoutsThisMonth >= 16
  },
  {
    key: 'yearly_200', name: 'Yıllık Titan', emoji: '🗿',
    description: 'Yılda 200+ antrenman yap',
    category: 'Tutarlılık',
    check: (d) => d.workoutsThisYear >= 200
  }
];

export const BADGE_CATEGORIES = ['Güç', 'Seri', 'Hacim', 'ELO', 'Çeşitlilik', 'Tutarlılık'];

export const CATEGORY_EMOJIS = {
  'Güç': '💪', 'Seri': '🔥', 'Hacim': '📊',
  'ELO': '🎮', 'Çeşitlilik': '🎨', 'Tutarlılık': '📅'
};

export default BADGES;
