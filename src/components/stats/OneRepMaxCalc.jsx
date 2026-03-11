import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const FORMULAS = [
  { key: 'epley', label: 'Epley', calc: (w, r) => r === 1 ? w : w * (1 + r / 30) },
  { key: 'brzycki', label: 'Brzycki', calc: (w, r) => r === 1 ? w : w * 36 / (37 - r) }
];

const MAX_REPS = 15;
const PERCENTAGES = [100, 95, 90, 85, 80, 75, 70, 65];

const REP_RANGES = {
  100: '1',
  95: '2',
  90: '3-4',
  85: '5-6',
  80: '7-8',
  75: '9-10',
  70: '11-12',
  65: '13-15'
};

const OneRepMaxCalc = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [formula, setFormula] = useState('epley');
  const [recentExercises, setRecentExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    fetchRecentExercises();
  }, [session?.user?.id]);

  const fetchRecentExercises = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('workout_logs')
      .select('weight_kg, reps, exercise_id, exercises(name_tr), workouts!inner(user_id)')
      .eq('workouts.user_id', session.user.id)
      .order('weight_kg', { ascending: false });

    if (data) {
      // Group by exercise, keep best lift per exercise
      const bestByEx = {};
      data.forEach(log => {
        const name = log.exercises?.name_tr;
        if (!name) return;
        if (!bestByEx[name] || log.weight_kg > bestByEx[name].weight_kg) {
          bestByEx[name] = { name, weight_kg: log.weight_kg, reps: log.reps };
        }
      });
      const sorted = Object.values(bestByEx).sort((a, b) => b.weight_kg - a.weight_kg);
      setRecentExercises(sorted);
    }
    setLoading(false);
  };

  const handleExerciseSelect = (name) => {
    setSelectedExercise(name);
    const ex = recentExercises.find(e => e.name === name);
    if (ex) {
      setWeight(String(ex.weight_kg));
      setReps(String(Math.min(ex.reps, MAX_REPS)));
    }
  };

  const activeFormula = FORMULAS.find(f => f.key === formula);
  const w = parseFloat(weight) || 0;
  const r = Math.min(parseInt(reps) || 0, MAX_REPS);
  const oneRM = w > 0 && r > 0 ? Math.round(activeFormula.calc(w, r)) : 0;

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Tahmini Maks</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', border: '1px solid var(--border-color)',
            color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-gaming)'
          }}
        >
          ← Profil
        </button>
      </div>

      {/* Formula Toggle */}
      <div style={{
        display: 'flex', gap: '4px', padding: '3px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius)', marginBottom: '1.5rem'
      }}>
        {FORMULAS.map(f => (
          <button
            key={f.key}
            onClick={() => setFormula(f.key)}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)',
              background: formula === f.key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: formula === f.key ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: formula === f.key ? 700 : 500,
              fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-gaming)',
              transition: 'all 0.2s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Exercise Picker */}
      {recentExercises.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <label className="stat-label" style={{ display: 'block', marginBottom: '8px' }}>HAREKET SEÇ</label>
          <select
            value={selectedExercise}
            onChange={(e) => handleExerciseSelect(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)',
              fontFamily: 'var(--font-gaming)', fontSize: '0.85rem',
              outline: 'none', cursor: 'pointer',
              appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%238E8E93\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center'
            }}
          >
            <option value="">Manuel giriş yap...</option>
            {recentExercises.map((ex, i) => (
              <option key={i} value={ex.name}>{ex.name} — {ex.weight_kg}kg × {ex.reps}</option>
            ))}
          </select>
        </div>
      )}

      {/* Weight & Reps Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
        <div>
          <label className="stat-label" style={{ display: 'block', marginBottom: '8px' }}>AĞIRLIK (KG)</label>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="100"
            style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
          />
        </div>
        <div>
          <label className="stat-label" style={{ display: 'block', marginBottom: '8px' }}>TEKRAR</label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="15"
            value={reps}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (e.target.value === '') setReps('');
              else if (val > MAX_REPS) setReps(String(MAX_REPS));
              else setReps(e.target.value);
            }}
            placeholder="5"
            style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
          />
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>maks. 15</div>
        </div>
      </div>

      {/* 1RM Result */}
      <div className="card" style={{
        padding: '2rem', textAlign: 'center', marginBottom: '1.5rem',
        border: oneRM > 0 ? '1px solid rgba(57,255,20,0.2)' : '1px solid var(--border-color)',
        transition: 'border-color 0.3s ease'
      }}>
        <div className="stat-label" style={{ marginTop: 0, marginBottom: '8px' }}>TAHMİNİ 1RM</div>
        <div style={{
          fontSize: oneRM > 0 ? '3.5rem' : '2.5rem',
          fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1,
          color: oneRM > 0 ? 'var(--neon-green)' : 'var(--text-muted)',
          transition: 'all 0.3s ease'
        }}>
          {oneRM > 0 ? `${oneRM} kg` : '—'}
        </div>
        {oneRM > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {activeFormula.label} formülü · {w}kg × {r} tekrar
          </div>
        )}
      </div>

      {/* Percentage Breakdown Table */}
      {oneRM > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="stat-label" style={{ marginTop: 0, marginBottom: '14px' }}>ANTRENMAN BÖLGELERİ</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PERCENTAGES.map((pct, i) => {
              const pctWeight = Math.round(oneRM * pct / 100);
              const is100 = pct === 100;
              return (
                <div key={pct} style={{
                  display: 'grid', gridTemplateColumns: '50px 1fr 70px 60px',
                  alignItems: 'center', gap: '8px',
                  padding: '10px 0',
                  borderBottom: i < PERCENTAGES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  {/* Percentage */}
                  <span style={{
                    fontSize: '0.85rem', fontWeight: is100 ? 800 : 600,
                    color: is100 ? 'var(--neon-green)' : pct >= 85 ? 'var(--color-danger)' : pct >= 70 ? 'var(--gold)' : 'var(--text-muted)'
                  }}>
                    %{pct}
                  </span>
                  {/* Bar */}
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px', width: `${pct}%`,
                      background: is100 ? 'var(--neon-green)' : pct >= 85 ? 'var(--color-danger)' : pct >= 70 ? 'var(--gold)' : 'var(--text-muted)',
                      opacity: 0.6, transition: 'width 0.4s ease'
                    }} />
                  </div>
                  {/* Weight */}
                  <span style={{
                    fontSize: '0.9rem', fontWeight: 700, textAlign: 'right',
                    color: is100 ? 'var(--neon-green)' : 'var(--text-main)'
                  }}>
                    {pctWeight} kg
                  </span>
                  {/* Rep range */}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {REP_RANGES[pct]} rep
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info note */}
      <div style={{
        padding: '12px 16px', borderRadius: 'var(--radius-sm)',
        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
        fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6
      }}>
        ⚠️ Bu hesaplama yalnızca <strong style={{color:'var(--text-main)'}}>en optimal form</strong> ve <strong style={{color:'var(--text-main)'}}>tam hareket aralığında (full ROM)</strong> yapılan setler için geçerlidir. Maksimum 15 tekrar ile sınırlıdır — yüksek tekrarlarda sapma artarak sakatlık riskini yükseltir.
      </div>
    </div>
  );
};

export default OneRepMaxCalc;
