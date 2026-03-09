import React, { useState, useEffect } from 'react';
import { supabase } from '../core/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import WorkoutTracker from './WorkoutTracker';
import WorkoutSummary from './WorkoutSummary';
import ProgramWizard from './ProgramWizard';

const WorkoutLogger = ({ activeProgram, onUpdateProgram }) => {
  const { session, user } = useAuth();
  const { addWorkoutOptimistic } = useUserData();
  
  const [activeDay, setActiveDay] = useState(null);
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [exercisesCatalog, setExercisesCatalog] = useState([]);

  useEffect(() => {
    supabase.from('exercises').select('*').then(({data}) => {
      if (data) setExercisesCatalog(data);
    });
  }, []);

  const handleLogWorkout = async (newLog) => {
    if (!session?.user) return;
    
    // 1. Insert Workout
    const { data: insertedWorkout, error: workoutError } = await supabase.from('workouts').insert({
      user_id: session.user.id,
      program_name: newLog.programName,
      day_name: newLog.dayName,
      total_volume: newLog.analysis.totalVolume || 0,
      elo_gained: Math.floor((newLog.analysis.totalVolume || 0) / 100)
    }).select().single();

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
            reps: parseInt(set.reps)
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
      safeCompareString: `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
      dateString: today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    
    if (addWorkoutOptimistic) {
        addWorkoutOptimistic(uiLog);
    }

    // 4. Update ELO (The real ELO is updated via AuthContext refetch optionally, but we update the DB here)
    if (user) {
      const newElo = user.elo_score + insertedWorkout.elo_gained;
      await supabase.from('profiles').update({ elo_score: newElo }).eq('id', session.user.id);
      // Optional: trigger AuthContext refetch if we added a method, but for now it'll sync on reload
    }
  };


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
                onSaveProgram={(prog) => { onUpdateProgram(prog); setIsWizardOpen(false); }} 
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
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{activeProgram.programName}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Bugün hangi günü uygulayacaksın?</p>
        </div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeProgram.routine.map((dayPlan, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveDay(dayPlan)}
            className="card"
            disabled={!dayPlan.exercises || dayPlan.exercises.length === 0}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '1.5rem', cursor: (!dayPlan.exercises || dayPlan.exercises.length === 0) ? 'not-allowed' : 'pointer', 
              textAlign: 'left', border: 'none', background: 'rgba(255,255,255,0.03)',
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
              onSaveProgram={(prog) => { onUpdateProgram(prog); setIsWizardOpen(false); }} 
              onClose={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;
