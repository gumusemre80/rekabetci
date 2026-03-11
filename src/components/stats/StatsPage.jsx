import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../ui/EmptyState';

const PERIODS = [
  { key: 'weekly', label: 'Haftalık', days: 7 },
  { key: 'monthly', label: 'Aylık', days: 30 },
  { key: 'yearly', label: 'Yıllık', days: 365 }
];

const MUSCLE_COLORS = {
  'Göğüs': '#FF6B6B',
  'Sırt':  '#4ECDC4',
  'Bacak': '#45B7D1',
  'Omuz':  '#F9CA24',
  'Kollar':'#A29BFE',
  'Karın': '#FD79A8'
};

const StatsPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('monthly');
  const [workouts, setWorkouts] = useState([]);
  const [prevWorkouts, setPrevWorkouts] = useState([]);
  const [topLift, setTopLift] = useState(null);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [muscleData, setMuscleData] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  const activePeriod = PERIODS.find(p => p.key === period);

  useEffect(() => {
    if (!session?.user) return;
    fetchStats();
  }, [session?.user?.id, period]);

  const fetchStats = async () => {
    setLoading(true);
    setExpandedExercise(null);
    const now = new Date();
    const since = new Date();
    since.setDate(since.getDate() - activePeriod.days);
    const sinceStr = since.toISOString().split('T')[0];

    // Previous period range
    const prevEnd = new Date(since);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - activePeriod.days);
    const prevStartStr = prevStart.toISOString().split('T')[0];
    const prevEndStr = prevEnd.toISOString().split('T')[0];

    // 1) Current period workouts
    const { data: wData } = await supabase
      .from('workouts')
      .select('id, date, total_volume, elo_gained, day_name')
      .eq('user_id', session.user.id)
      .gte('date', sinceStr)
      .order('date', { ascending: true });

    setWorkouts(wData || []);

    // 2) Previous period workouts (for comparison)
    const { data: prevData } = await supabase
      .from('workouts')
      .select('id, date, total_volume, elo_gained, day_name')
      .eq('user_id', session.user.id)
      .gte('date', prevStartStr)
      .lt('date', prevEndStr)
      .order('date', { ascending: true });

    setPrevWorkouts(prevData || []);

    const currentIds = (wData || []).map(w => w.id);
    const safeIds = currentIds.length > 0 ? currentIds : ['00000000-0000-0000-0000-000000000000'];

    // 3) Top lift
    const { data: liftData } = await supabase
      .from('workout_logs')
      .select('weight_kg, reps, exercise_id, workout_id, exercises(name_tr)')
      .in('workout_id', safeIds)
      .order('weight_kg', { ascending: false })
      .limit(1)
      .maybeSingle();

    setTopLift(liftData);

    // 4) Personal Records — top lifts by exercise
    const { data: prData } = await supabase
      .from('workout_logs')
      .select('weight_kg, reps, exercise_id, workout_id, exercises(name_tr, category), workouts!inner(date)')
      .in('workout_id', safeIds)
      .order('weight_kg', { ascending: false });

    if (prData && prData.length > 0) {
      // Group by exercise, keep only the best lift per exercise
      const bestByExercise = {};
      prData.forEach(log => {
        const name = log.exercises?.name_tr || 'Bilinmeyen';
        if (!bestByExercise[name] || log.weight_kg > bestByExercise[name].weight_kg) {
          bestByExercise[name] = log;
        }
      });
      const sorted = Object.values(bestByExercise)
        .sort((a, b) => b.weight_kg - a.weight_kg)
        .slice(0, 5);
      setPersonalRecords(sorted);

      // 5) Muscle group volume breakdown
      const muscleVolume = {};
      prData.forEach(log => {
        const group = log.exercises?.category || 'Diğer';
        const vol = (log.weight_kg || 0) * (log.reps || 0);
        muscleVolume[group] = (muscleVolume[group] || 0) + vol;
      });
      const totalMuscleVol = Object.values(muscleVolume).reduce((s, v) => s + v, 0);
      const muscleArr = Object.entries(muscleVolume)
        .map(([name, volume]) => ({ name, volume, pct: totalMuscleVol > 0 ? (volume / totalMuscleVol * 100) : 0 }))
        .sort((a, b) => b.volume - a.volume);
      setMuscleData(muscleArr);

      // 6) Exercise list for detail view
      const exerciseMap = {};
      prData.forEach(log => {
        const name = log.exercises?.name_tr || 'Bilinmeyen';
        if (!exerciseMap[name]) exerciseMap[name] = { name, sessions: {} };
        const date = log.workouts?.date;
        if (!exerciseMap[name].sessions[date]) {
          exerciseMap[name].sessions[date] = [];
        }
        exerciseMap[name].sessions[date].push({ weight: log.weight_kg, reps: log.reps });
      });
      const exList = Object.values(exerciseMap).map(ex => ({
        name: ex.name,
        sessionCount: Object.keys(ex.sessions).length,
        bestWeight: Math.max(...Object.values(ex.sessions).flatMap(s => s.map(l => l.weight))),
        progressData: Object.entries(ex.sessions)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, sets]) => ({
            date,
            maxWeight: Math.max(...sets.map(s => s.weight)),
            totalSets: sets.length,
            totalReps: sets.reduce((s, l) => s + l.reps, 0)
          }))
      }));
      exList.sort((a, b) => b.sessionCount - a.sessionCount);
      setExerciseList(exList);
    } else {
      setPersonalRecords([]);
      setMuscleData([]);
      setExerciseList([]);
    }

    setLoading(false);
  };

  // ── Computed stats ──
  const stats = useMemo(() => {
    if (!workouts.length) return null;

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((s, w) => s + (w.total_volume || 0), 0);
    const totalElo = workouts.reduce((s, w) => s + (w.elo_gained || 0), 0);
    const avgVolume = totalVolume / totalWorkouts;

    // Most trained day
    const dayCount = {};
    workouts.forEach(w => { dayCount[w.day_name] = (dayCount[w.day_name] || 0) + 1; });
    const favDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    // Streak
    const today = new Date();
    let streak = 0;
    const dateSet = new Set(workouts.map(w => w.date));
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (dateSet.has(key)) streak++;
      else if (i > 0) break;
    }

    // Weekly breakdown for bar chart
    const bucketCount = period === 'weekly' ? 7 : period === 'monthly' ? 4 : 12;
    const bucketDays = period === 'weekly' ? 1 : period === 'monthly' ? 7 : 30;
    const bucketLabels = period === 'weekly'
      ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
      : period === 'monthly'
        ? ['Hafta 1', 'Hafta 2', 'Hafta 3', 'Hafta 4']
        : ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    const weekBuckets = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketEnd = new Date();
      bucketEnd.setDate(bucketEnd.getDate() - (i * bucketDays));
      const bucketStart = new Date(bucketEnd);
      bucketStart.setDate(bucketStart.getDate() - bucketDays);

      const bucketVolume = workouts
        .filter(w => {
          const d = new Date(w.date);
          return d >= bucketStart && d <= bucketEnd;
        })
        .reduce((s, w) => s + (w.total_volume || 0), 0);

      weekBuckets.unshift({ label: bucketLabels[bucketCount - 1 - i] || `${i + 1}`, volume: bucketVolume });
    }

    return { totalWorkouts, totalVolume, totalElo, avgVolume, favDay, streak, weekBuckets };
  }, [workouts, period]);

  // ── Comparison vs previous period ──
  const comparison = useMemo(() => {
    if (!stats) return null;
    const prevTotal = prevWorkouts.length;
    const prevVolume = prevWorkouts.reduce((s, w) => s + (w.total_volume || 0), 0);
    const prevElo = prevWorkouts.reduce((s, w) => s + (w.elo_gained || 0), 0);

    return {
      workouts: stats.totalWorkouts - prevTotal,
      volume: stats.totalVolume - prevVolume,
      elo: stats.totalElo - prevElo
    };
  }, [stats, prevWorkouts]);

  const maxBucketVolume = stats ? Math.max(...stats.weekBuckets.map(b => b.volume), 1) : 1;

  const periodLabel = activePeriod.key === 'weekly' ? 'hafta' : activePeriod.key === 'monthly' ? 'ay' : 'yıl';

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="page-enter" style={{ padding: '1rem 0' }}>
        <div className="skeleton skeleton-text-lg" style={{ width: '50%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: '1.5rem' }}></div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
          <div className="skeleton" style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-sm)' }}></div>
          <div className="skeleton" style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-sm)' }}></div>
          <div className="skeleton" style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-sm)' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="skeleton skeleton-block"></div>
          <div className="skeleton skeleton-block"></div>
          <div className="skeleton skeleton-block"></div>
          <div className="skeleton skeleton-block"></div>
        </div>
        <div className="skeleton skeleton-block" style={{ height: '120px', marginTop: '1rem' }}></div>
        <div className="skeleton skeleton-block" style={{ height: '160px', marginTop: '1rem' }}></div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>İstatistikler</h2>
        <button
          className="btn-back"
          onClick={() => navigate('/')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Profil
        </button>
      </div>

      {/* Period Tabs */}
      <div style={{
        display: 'flex', gap: '4px', padding: '3px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius)', marginBottom: '1.5rem'
      }}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)',
              background: period === p.key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: period === p.key ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: period === p.key ? 700 : 500,
              fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-gaming)',
              transition: 'all 0.2s ease'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!stats ? (
        <EmptyState 
           icon="📊" 
           title="Veri Yok" 
           message="Bu dönemde henüz antrenman verisi bulunmuyor. Antrenman yaptıkça istatistiklerin burada belirecek." 
        />
      ) : (
        <>
          {/* ═══ 1) Stat Cards Grid ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
            <StatCard label="Antrenman" value={stats.totalWorkouts} color="var(--accent)" />
            <StatCard label="Toplam Hacim" value={`${Math.round(stats.totalVolume).toLocaleString()} kg`} color="var(--color-success)" />
            <StatCard label="ELO Kazanılan" value={`+${stats.totalElo}`} color="var(--gold)" />
            <StatCard label="Günlük Seri" value={`${stats.streak} gün`} color="var(--neon-green)" />
            <StatCard label="Ort. Hacim/Seans" value={`${Math.round(stats.avgVolume).toLocaleString()} kg`} color="var(--text-muted)" />
            <StatCard label="Favori Gün" value={stats.favDay} color="var(--bronze)" />
          </div>

          {/* ═══ 2) Period Comparison Banner ═══ */}
          {comparison && (
            <div className="stats-comparison">
              <div className="stat-label" style={{ marginTop: 0, marginBottom: '10px', fontSize: '0.65rem' }}>
                ÖNCEKİ {periodLabel.toUpperCase()} İLE KARŞILAŞTIRMA
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <ComparisonPill label="Antrenman" value={comparison.workouts} suffix="" />
                <ComparisonPill label="Hacim" value={comparison.volume} suffix=" kg" />
                <ComparisonPill label="ELO" value={comparison.elo} suffix="" />
              </div>
            </div>
          )}

          {/* ═══ 3) Top Lift ═══ */}
          {topLift && (
            <div className="card card-glow" style={{ padding: '1rem 1.25rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="stat-label" style={{ marginTop: 0 }}>En Ağır Kaldırış</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                  {topLift.weight_kg} kg × {topLift.reps} tekrar
                </div>
                {topLift.exercises?.name_tr && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {topLift.exercises.name_tr}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '1.5rem' }}>🏆</div>
            </div>
          )}

          {/* ═══ 4) Personal Records ═══ */}
          {personalRecords.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="stat-label" style={{ marginBottom: '10px' }}>KİŞİSEL REKORLAR</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {personalRecords.map((pr, i) => (
                  <div
                    key={i}
                    className={`card ${i === 0 ? 'pr-card-gold' : ''}`}
                    style={{
                      padding: '12px 16px', margin: 0,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800,
                        background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--silver)' : i === 2 ? 'var(--bronze)' : 'rgba(255,255,255,0.08)',
                        color: i < 3 ? '#000' : 'var(--text-muted)'
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{pr.exercises?.name_tr}</div>
                        {pr.workouts?.date && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {new Date(pr.workouts.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: i === 0 ? 'var(--gold)' : 'var(--text-main)' }}>
                        {pr.weight_kg} kg
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        × {pr.reps}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ 5) Volume Trend Chart ═══ */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '16px' }}>
            <div className="stat-label" style={{ marginTop: 0, marginBottom: '1rem' }}>HACİM TRENDİ</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
              {stats.weekBuckets.map((b, i) => {
                const heightPct = Math.max((b.volume / maxBucketVolume) * 100, 4);
                const isMax = b.volume === maxBucketVolume && b.volume > 0;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    {/* Volume label on top */}
                    {b.volume > 0 && (
                      <div style={{
                        fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '4px',
                        whiteSpace: 'nowrap', fontWeight: 600
                      }}>
                        {b.volume >= 1000 ? `${(b.volume / 1000).toFixed(1)}k` : Math.round(b.volume)}
                      </div>
                    )}
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: b.volume > 0
                        ? 'linear-gradient(180deg, var(--neon-green), rgba(57,255,20,0.2))'
                        : 'rgba(255,255,255,0.04)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                      minHeight: '3px',
                      animation: isMax ? 'pulse 2s ease infinite' : 'none',
                      position: 'relative'
                    }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>
                      {b.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ 6) Muscle Group Breakdown ═══ */}
          {muscleData.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '16px' }}>
              <div className="stat-label" style={{ marginTop: 0, marginBottom: '14px' }}>KAS GRUBU DAĞILIMI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {muscleData.map((m, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {Math.round(m.volume).toLocaleString()} kg · {Math.round(m.pct)}%
                      </span>
                    </div>
                    <div style={{
                      height: '8px', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.06)', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '4px',
                        width: `${m.pct}%`,
                        background: `linear-gradient(90deg, ${MUSCLE_COLORS[m.name] || '#888'}, ${MUSCLE_COLORS[m.name] || '#888'}88)`,
                        transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ 7) Exercise Detail View ═══ */}
          {exerciseList.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="stat-label" style={{ marginBottom: '10px' }}>HAREKET DETAYLARI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {exerciseList.map((ex, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedExercise(expandedExercise === ex.name ? null : ex.name)}
                      className="card"
                      style={{
                        width: '100%', padding: '12px 16px', margin: 0, cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        textAlign: 'left', color: 'var(--text-main)',
                        border: expandedExercise === ex.name ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border-color)',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{ex.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ex.sessionCount} seans · En iyi: {ex.bestWeight} kg
                        </div>
                      </div>
                      <span style={{
                        color: 'var(--text-muted)', fontSize: '0.8rem',
                        transform: expandedExercise === ex.name ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s ease', display: 'inline-block'
                      }}>
                        →
                      </span>
                    </button>

                    {/* Expanded detail */}
                    {expandedExercise === ex.name && ex.progressData.length > 0 && (
                      <div style={{
                        padding: '16px', margin: '0',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '0 0 var(--radius) var(--radius)',
                        border: '1px solid var(--border-color)', borderTop: 'none',
                        animation: 'fadeIn 0.25s ease-out'
                      }}>
                        {/* Mini progress chart */}
                        <div className="stat-label" style={{ marginTop: 0, marginBottom: '10px' }}>AĞIRLIK İLERLEMESİ</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', marginBottom: '12px' }}>
                          {(() => {
                            const maxW = Math.max(...ex.progressData.map(p => p.maxWeight), 1);
                            return ex.progressData.map((p, j) => (
                              <div key={j} style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', height: '100%', justifyContent: 'flex-end'
                              }}>
                                <div style={{
                                  fontSize: '0.5rem', color: 'var(--text-muted)', marginBottom: '2px',
                                  fontWeight: 600
                                }}>
                                  {p.maxWeight}
                                </div>
                                <div style={{
                                  width: '100%',
                                  height: `${Math.max((p.maxWeight / maxW) * 100, 6)}%`,
                                  background: 'linear-gradient(180deg, var(--accent), rgba(255,255,255,0.15))',
                                  borderRadius: '3px 3px 0 0',
                                  minHeight: '4px'
                                }} />
                                <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  {new Date(p.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                        {/* Session list */}
                        {ex.progressData.map((p, j) => (
                          <div key={j} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '6px 0', borderBottom: j < ex.progressData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            fontSize: '0.75rem'
                          }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {new Date(p.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </span>
                            <span>
                              <span style={{ fontWeight: 600 }}>{p.maxWeight} kg</span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                                {p.totalSets} set · {p.totalReps} tekrar
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Helper Components ──

const StatCard = ({ label, value, color }) => (
  <div className="card card-glow" style={{ padding: '1rem 1.25rem', margin: 0 }}>
    <div className="stat-label" style={{ marginTop: 0 }}>{label}</div>
    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '6px', color, letterSpacing: '-0.02em' }}>
      {value}
    </div>
  </div>
);

const ComparisonPill = ({ label, value, suffix }) => {
  const isPositive = value > 0;
  const isZero = value === 0;
  const displayValue = isZero ? '0' : `${isPositive ? '+' : ''}${typeof value === 'number' && Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value)}${suffix}`;

  return (
    <div style={{
      flex: 1, padding: '8px 6px', borderRadius: 'var(--radius-sm)',
      background: isZero ? 'rgba(255,255,255,0.04)' : isPositive ? 'rgba(50,215,75,0.08)' : 'rgba(255,69,58,0.08)',
      border: `1px solid ${isZero ? 'var(--border-color)' : isPositive ? 'rgba(50,215,75,0.2)' : 'rgba(255,69,58,0.2)'}`,
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-0.01em',
        color: isZero ? 'var(--text-muted)' : isPositive ? 'var(--color-success)' : 'var(--color-danger)'
      }}>
        {displayValue}
      </div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
};

export default StatsPage;
