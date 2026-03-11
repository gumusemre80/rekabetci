import React, { useEffect, useState } from 'react';
import { analyzeWorkout } from '../../core/analysisEngine';
import { checkBadges } from '../../core/badgeEngine';
import { supabase } from '../../core/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const WorkoutSummary = ({ workoutData, onFinish }) => {
  const { session } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    // Run the engine precisely once when component mounts
    if (workoutData?.exercisesLogged) {
       const results = analyzeWorkout(workoutData.exercisesLogged);
       setAnalysis(results);

       // Check for new badges
       if (session?.user?.id) {
         checkBadges(session.user.id, supabase, results.totalVolume)
           .then(({ newBadges: earned }) => setNewBadges(earned))
           .catch(console.error);
       }
    }
  }, [workoutData]);

  if (!analysis) return <div style={{ textAlign: 'center', padding: '2rem' }}>Analiz Ediliyor...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '1rem',
        }}>🏆</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{workoutData.dayName} Tamamlandı!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {workoutData.dateString}
        </p>
        <p style={{ color: 'var(--text-muted)' }}>Bugün kaldırılan toplam hacim: <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{analysis.totalVolume.toLocaleString()} kg</span></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ═══ NEW BADGES CELEBRATION ═══ */}
        {newBadges.length > 0 && (
          <div className="card" style={{
            borderLeft: '4px solid var(--gold)',
            backgroundColor: 'var(--gold-dim)',
            animation: 'fadeIn 0.6s ease-out'
          }}>
            <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎖️ Yeni Rozetler Kazanıldı!
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {newBadges.map((badge, i) => (
                <div key={badge.key} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-bg)',
                  animation: `fadeIn 0.4s ease-out ${i * 0.15}s both`
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{badge.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{badge.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Praise / Positive Reinforcement Box */}
        {analysis.praises.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid var(--color-success)', backgroundColor: 'var(--color-success-bg)' }}>
             <h3 style={{ color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⭐ Övgüler
             </h3>
             <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)' }}>
               {analysis.praises.map((praise, i) => (
                 <li key={i} style={{ marginBottom: '0.75rem', lineHeight: 1.5 }}>
                   {praise}
                 </li>
               ))}
             </ul>
          </div>
        )}

        {/* Suggestions / Coaching Adjustments Box */}
        {analysis.suggestions.length > 0 && (
           <div className="card" style={{ borderLeft: '4px solid var(--color-warning)', backgroundColor: 'var(--color-warning-bg)' }}>
             <h3 style={{ color: 'var(--color-warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📈 Gelişim Tavsiyeleri
             </h3>
             <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)' }}>
               {analysis.suggestions.map((suggestion, i) => (
                 <li key={i} style={{ marginBottom: '0.75rem', lineHeight: 1.5 }}>
                   {suggestion}
                 </li>
               ))}
             </ul>
          </div>
        )}

        {/* Breakdown Summary */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Kaldırılan Ağırlık Özeti</h4>
          {workoutData.exercisesLogged.map((ex, idx) => {
            if (!ex.loggedSets || ex.loggedSets.length === 0) return null;
            
            const bestSet = ex.loggedSets.reduce((prev, current) => 
               (parseFloat(prev.kg) > parseFloat(current.kg)) ? prev : current
            );

            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 500 }}>{ex.name}</span>
                <span style={{ color: 'var(--accent)' }}>Top Set: {bestSet.kg}kg</span>
              </div>
            );
          })}
        </div>

      </div>

      <button onClick={() => onFinish(analysis)} className="btn-primary" style={{ width: '100%', marginTop: '3rem', padding: '1.25rem' }}>
        Ana Ekrana Dön
      </button>

    </div>
  );
};

export default WorkoutSummary;
