import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../core/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import WorkoutTracker from './WorkoutTracker';
import WorkoutSummary from './WorkoutSummary';
import ProgramWizard from './ProgramWizard';

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
    supabase.from('exercises').select('*').then(({data}) => {
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
      safeCompareString: `${today.getFullYear()}-${String(today.getMonth()).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
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
      <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Aktif Program Yok</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Antrenman takibi yapabilmek için önce hedeflerine uygun bir program oluşturmalısın.</p>
        <button onClick={() => setIsWizardOpen(true)} className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '1rem 2rem' }}>Program Sihirbazına Git</button>
        {isWizardOpen && (
          <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setIsWizardOpen(false); }}>
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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{activeProgram.programName}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Bugün hangi günü uygulayacaksın?</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="magic-wand-btn" 
            onClick={() => navigate('/program')}
            style={{ fontSize: '0.8rem' }}
          >
            📋 Genel Bakış
          </button>
          <button className="magic-wand-btn" onClick={() => setIsWizardOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 4V2"/>
            <path d="M15 16v-2"/>
            <path d="M8 9h2"/>
            <path d="M20 9h2"/>
            <path d="M17.8 11.8l1.4 1.4"/>
            <path d="M10.8 4.8l1.4 1.4"/>
            <path d="M10.8 13.2l1.4-1.4"/>
            <path d="M17.8 6.2l1.4-1.4"/>
            <path d="m3 21 9-9"/>
            <path d="M12.2 12.2l4-4"/>
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
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {dayPlan.exercises && dayPlan.exercises.length > 0 ? `${dayPlan.exercises.length} Hareket →` : 'Dinlenme'}
            </div>
          </button>
        ))}
      </div>

      {isWizardOpen && (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setIsWizardOpen(false); }}>
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
