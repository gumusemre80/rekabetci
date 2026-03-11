import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../hooks/useUserData';
import WorkoutTracker from './WorkoutTracker';
import WorkoutSummary from './WorkoutSummary';
import ProgramWizard from './ProgramWizard';
import EmptyState from '../ui/EmptyState';

const WorkoutLogger = () => {
  const { session, user, refreshProfile } = useAuth();
  const { addWorkoutOptimistic } = useUserData();
  const navigate = useNavigate();

  const [activeProgram, setActiveProgram] = useState(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [exercisesCatalog, setExercisesCatalog] = useState([]);

  // Load exercises catalog
  useEffect(() => {
    supabase.from('exercises').select('*').then(({ data }) => {
      if (data) setExercisesCatalog(data);
    });
  }, []);

  // Load the user's active program from Supabase
  useEffect(() => {
    if (!session?.user) {
      setProgramLoading(false);
      return;
    }

    const fetchProgram = async () => {
      const { data } = await supabase
        .from('user_programs')
        .select('id, program_data')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.program_data) {
        setActiveProgram(data.program_data);
      }
      setProgramLoading(false);
    };

    fetchProgram();
  }, [session?.user?.id]);

  // Save a new program to Supabase
  const handleSaveProgram = async (prog) => {
    if (!session?.user) return;

    // Deactivate all existing programs
    await supabase
      .from('user_programs')
      .update({ is_active: false })
      .eq('user_id', session.user.id);

    // Insert new active program
    await supabase
      .from('user_programs')
      .insert({
        user_id: session.user.id,
        program_data: prog,
        is_active: true
      });

    setActiveProgram(prog);
    setIsWizardOpen(false);
  };

  const handleLogWorkout = async (newLog) => {
    if (!session?.user) return;

    // 1. Insert Workout
    const { data: insertedWorkout, error: workoutError } = await supabase.from('workouts').insert({
      user_id: session.user.id,
      program_name: newLog.programName,
      day_name: newLog.dayName,
      total_volume: newLog.analysis.totalVolume || 0,
      elo_gained: Math.floor((newLog.analysis.totalVolume || 0) / 100)
    }).select().maybeSingle();

    if (workoutError) {
      console.error(workoutError);
      return;
    }

    // 2. Insert Logs
    const logsToInsert = [];
    newLog.exercisesLogged.forEach(ex => {
      const matchedEx = exercisesCatalog.find(e => e.name_tr.toLowerCase() === ex.name.toLowerCase());
      ex.loggedSets.forEach(set => {
        logsToInsert.push({
          workout_id: insertedWorkout.id,
          exercise_id: matchedEx ? matchedEx.id : null,
          set_number: set.set,
          weight_kg: parseFloat(set.kg),
          reps: parseInt(set.reps),
          rpe: parseFloat(set.rpe) || null
        });
      });
    });

    if (logsToInsert.length > 0) {
      await supabase.from('workout_logs').insert(logsToInsert);
    }

    // 3. UI Optimistic Update via hook
    const today = new Date();
    const uiLog = {
      ...newLog,
      id: insertedWorkout.id,
      safeCompareString: `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      dateString: today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    if (addWorkoutOptimistic) {
      addWorkoutOptimistic(uiLog);
    }

    // 4. Update ELO
    if (user) {
      const newElo = user.elo_score + insertedWorkout.elo_gained;
      await supabase.from('profiles').update({ elo_score: newElo }).eq('id', session.user.id);
      await refreshProfile(); // Immediately sync the updated ELO to the UI
    }
  };

  if (programLoading) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <div className="skeleton skeleton-text-lg" style={{ width: '60%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '1.5rem' }}></div>
        <div className="skeleton skeleton-block"></div>
        <div className="skeleton skeleton-block"></div>
        <div className="skeleton skeleton-block"></div>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out', padding: '1rem 0' }}>
        <EmptyState
          icon="📋"
          title="Aktif Program Yok"
          message="Antrenman takibi yapabilmek için önce hedeflerine uygun bir program oluşturmalısın."
        >
          <button onClick={() => setIsWizardOpen(true)} className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '1rem 2rem' }}>
            Program Sihirbazına Git
          </button>
        </EmptyState>

        {isWizardOpen && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsWizardOpen(false); }}>
            <div className="modal-content">
              <ProgramWizard
                onSaveProgram={handleSaveProgram}
                onClose={() => setIsWizardOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (completedWorkout) {
    return <WorkoutSummary workoutData={completedWorkout} onFinish={(analysisData) => {
      const fullLog = {
        ...completedWorkout,
        analysis: analysisData,
        programName: activeProgram.programName,
        duration: activeProgram.duration
      };
      handleLogWorkout(fullLog);

      setCompletedWorkout(null);
      setActiveDay(null);
    }} />;
  }

  if (activeDay) {
    return <WorkoutTracker
      routineDay={activeDay}
      onCompleteWorkout={(logs) => setCompletedWorkout(logs)}
      onCancelWorkout={() => setActiveDay(null)}
    />;
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', lineHeight: '1.4', textWrap: 'balance' }}>{activeProgram.programName}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Bugün hangi günü uygulayacaksın?</p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={() => navigate('/program')}
            style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Genel Bakış
          </button>
          <button
            className="btn-secondary"
            onClick={() => setIsWizardOpen(true)}
            style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Programı Güncelle
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeProgram.routine.map((dayPlan, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDay(dayPlan)}
            className="card card-glow"
            disabled={!dayPlan.exercises || dayPlan.exercises.length === 0}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem 1.5rem', cursor: (!dayPlan.exercises || dayPlan.exercises.length === 0) ? 'not-allowed' : 'pointer',
              textAlign: 'left', background: 'rgba(255,255,255,0.03)',
              borderLeft: `3px solid hsl(${(idx * 60) % 360}, 60%, 55%)`,
              opacity: (!dayPlan.exercises || dayPlan.exercises.length === 0) ? 0.5 : 1
            }}
          >
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{dayPlan.day}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>{dayPlan.title || 'Dinlenme'}</div>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '4px',
              background: (dayPlan.exercises && dayPlan.exercises.length > 0) ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255,255,255,0.02)',
              color: (dayPlan.exercises && dayPlan.exercises.length > 0) ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: 600,
              border: `1px solid ${(dayPlan.exercises && dayPlan.exercises.length > 0) ? 'rgba(255,255,255,0.1)' : 'transparent'}`
            }}>
              {dayPlan.exercises && dayPlan.exercises.length > 0 ? (
                <>
                  {dayPlan.exercises.length} Hareket
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', opacity: 0.7 }}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              ) : (
                'Dinlenme'
              )}
            </div>
          </button>
        ))}
      </div>

      {isWizardOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsWizardOpen(false); }}>
          <div className="modal-content">
            <ProgramWizard
              onSaveProgram={handleSaveProgram}
              onClose={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;
