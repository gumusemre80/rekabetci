import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ProgramOverview = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    if (!session?.user) return;
    
    const fetchProgram = async () => {
      const { data } = await supabase
        .from('user_programs')
        .select('program_data, created_at')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data?.program_data) {
        setProgram({ ...data.program_data, createdAt: data.created_at });
      }
      setLoading(false);
    };
    
    fetchProgram();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!program) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Aktif Program Yok</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Henüz bir program oluşturmadın. Antrenman sayfasından yeni bir program oluşturabilirsin.
        </p>
        <button 
          onClick={() => navigate('/workout')} 
          className="btn-primary" 
          style={{ display: 'inline-block', width: 'auto', padding: '12px 24px' }}
        >
          Antrenman Sayfasına Git
        </button>
      </div>
    );
  }

  // Calculate totals
  const totalExercises = program.routine.reduce((sum, day) => sum + (day.exercises?.length || 0), 0);
  const totalSets = program.routine.reduce((sum, day) => {
    return sum + (day.exercises || []).reduce((daySum, ex) => {
      const sets = parseInt(ex.sets) || 0;
      return daySum + sets;
    }, 0);
  }, 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{program.programName}</h2>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
        <button
          className="btn-back"
          onClick={() => navigate('/workout')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Antrenman
        </button>
      </div>
        </div>
        
        {/* Meta Info Bar */}
        <div style={{ 
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          padding: '1rem', background: 'rgba(255,255,255,0.03)', 
          borderRadius: 'var(--radius-sm)', marginBottom: '1rem'
        }}>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Split</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px' }}>{program.splitType}</div>
          </div>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Süre</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px' }}>{program.duration}</div>
          </div>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dinlenme</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px' }}>{program.restTime}</div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ 
            flex: 1, padding: '1rem', background: 'var(--brand-cyan-dim)', 
            border: '1px solid var(--brand-cyan-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{program.routine.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Antrenman Günü</div>
          </div>
          <div style={{ 
            flex: 1, padding: '1rem', background: 'rgba(50,213,75,0.05)', 
            border: '1px solid rgba(50,213,75,0.15)', borderRadius: 'var(--radius-sm)', textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{totalExercises}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Toplam Hareket</div>
          </div>
          <div style={{ 
            flex: 1, padding: '1rem', background: 'rgba(255,214,10,0.05)', 
            border: '1px solid rgba(255,214,10,0.15)', borderRadius: 'var(--radius-sm)', textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>{totalSets}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Haftalık Set</div>
          </div>
        </div>
      </div>

      {/* Overload Rule */}
      <div style={{ 
        padding: '1rem', marginBottom: '1.5rem', 
        background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--accent)',
        fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>İlerleme Kuralı: </span>
        {program.overloadRule}
      </div>

      {/* Day-by-Day Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {program.routine.map((dayPlan, idx) => {
          const isExpanded = expandedDay === idx;
          const hasExercises = dayPlan.exercises && dayPlan.exercises.length > 0;
          
          return (
            <div key={idx} style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}>
              {/* Day Header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : idx)}
                style={{
                  width: '100%', padding: '1.25rem', border: 'none', 
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.03em' }}>
                    {dayPlan.day}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                    {dayPlan.title || 'Dinlenme'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasExercises && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {dayPlan.exercises.length} hareket
                    </span>
                  )}
                  <span style={{ 
                    color: 'var(--text-muted)', fontSize: '1.2rem', 
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease', display: 'inline-block'
                  }}>
                    ▾
                  </span>
                </div>
              </button>

              {/* Expanded Exercise List */}
              {isExpanded && hasExercises && (
                <div style={{ padding: '0 1.25rem 1.25rem', animation: 'fadeIn 0.15s ease-out' }}>
                  {/* Table Header */}
                  <div style={{ 
                    display: 'flex', padding: '8px 0', 
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    <div style={{ flex: 3 }}>Hareket</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>Set</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>Tekrar</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>RPE</div>
                  </div>

                  {/* Exercise Rows */}
                  {dayPlan.exercises.map((ex, exIdx) => (
                    <div key={exIdx} style={{ 
                      display: 'flex', padding: '12px 0', alignItems: 'center',
                      borderBottom: exIdx < dayPlan.exercises.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                    }}>
                      <div style={{ flex: 3 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
                          {ex.name}
                        </div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                        {ex.sets}
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                        {ex.reps}
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ex.rpe}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgramOverview;
