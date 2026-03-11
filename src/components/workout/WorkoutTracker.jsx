import React, { useState, useCallback, memo } from 'react';
import RestTimer from './RestTimer';

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
const getRpeColor = (rpe) => {
  if (rpe <= 7) return 'var(--color-success)';
  if (rpe <= 8) return 'var(--gold)';
  if (rpe <= 9) return '#ff8800';
  return 'var(--color-danger)';
};
const getRIR = (rpe) => Math.max(0, 10 - rpe);

const BASE_ALTERNATIVES = {
  'Barbell Back Squat': ['Leg Press', 'Dumbbell Goblet Squat'],
  'Barbell Bench Press': ['Dumbbell Bench Press', 'Machine Chest Press'],
  'Barbell Row': ['Seated Cable Row', 'Dumbbell Row'],
  'Lateral Raise': ['Machine Lateral Raise', 'Cable Lateral Raise'],
  'Rope Triceps Extension': ['Skullcrusher', 'Triceps Pushdown'],
  'Deadlift': ['Romanian Deadlift (RDL)', 'Trap Bar Deadlift'],
  'Overhead Press': ['Dumbbell Shoulder Press', 'Machine Shoulder Press'],
  'Lat Pulldown / Pull-up': ['Assisted Pull-up', 'Single Arm Lat Pulldown'],
  'Leg Curl': ['Seated Leg Curl', 'Lying Leg Curl'],
  'Barbell Biceps Curl': ['Dumbbell Hammer Curl', 'Preacher Curl Machine'],
  'Incline Dumbbell Press': ['Incline Barbell Press', 'Pek Dek Machine'],
  'Seated Cable Row': ['T-Bar Row', 'Chest-Supported Row Machine'],
  'Bulgarian Split Squat': ['Walking Lunges', 'Leg Extension'],
  'Calf Raise': ['Seated Calf Raise', 'Standing Calf Raise Machine'],
  'Weighted Pull-up / Pulldown': ['Lat Pulldown', 'Straight Arm Pulldown'],
  'Cable Fly': ['Pec Deck Machine', 'Dumbbell Fly'],
  'Romanian Deadlift (RDL)': ['Good Mornings', 'Glute Ham Raise'],
  'Leg Press': ['Hack Squat', 'Front Squat'],
  'Hanging Leg Raise': ['Cable Crunch', 'Lying Leg Raise'],
  'Dumbbell Lateral Raise': ['Cable Lateral Raise', 'Machine Lateral Raise'],
  'Face Pulls': ['Rear Delt Fly Machine', 'Dumbbell Rear Delt Raise'],
  'Dumbbell Biceps Curl': ['Cable Curl', 'EZ Bar Curl'],
  'Leg Extension': ['Sissy Squat', 'Bulgarian Split Squat'],
  'Lying Leg Curl': ['Seated Leg Curl', 'Glute Ham Raise'],
  'Seated Calf Raise': ['Standing Calf Raise', 'Donkey Calf Raise'],
  'Cable Crunch': ['Decline Crunch', 'Ab Wheel Rollout'],
  'Triceps Pushdown': ['Overhead Triceps Extension', 'Close Grip Bench Press'],
  'EZ Bar Curl': ['Dumbbell Curl', 'Cable Curl'],
  'Standing Calf Raise': ['Leg Press Calf Raise', 'Seated Calf Raise']
};

// Generate Bidirectional Map: if A -> B, then B -> A
const EXERCISE_ALTERNATIVES = {};
Object.entries(BASE_ALTERNATIVES).forEach(([mainEx, alts]) => {
  if (!EXERCISE_ALTERNATIVES[mainEx]) EXERCISE_ALTERNATIVES[mainEx] = new Set();
  alts.forEach(alt => {
    EXERCISE_ALTERNATIVES[mainEx].add(alt);
    if (!EXERCISE_ALTERNATIVES[alt]) EXERCISE_ALTERNATIVES[alt] = new Set();
    EXERCISE_ALTERNATIVES[alt].add(mainEx);
    // Link alternatives to each other (if B and C are alts of A, B is alt of C)
    alts.forEach(innerAlt => {
       if (innerAlt !== alt) EXERCISE_ALTERNATIVES[alt].add(innerAlt);
    });
  });
});

// Convert Sets back to Arrays for rendering
Object.keys(EXERCISE_ALTERNATIVES).forEach(key => {
  EXERCISE_ALTERNATIVES[key] = Array.from(EXERCISE_ALTERNATIVES[key]);
});

const ExerciseRow = memo(({ 
  ex, 
  idx, 
  currentInput, 
  isSwapping, 
  isResting, 
  alternatives, 
  onSwapToggle, 
  onSwapConfirm, 
  onRemoveSet, 
  onLogSet, 
  onInputChange, 
  onRestComplete, 
  onRestSkip 
}) => {
  const targetSets = parseInt(ex.sets);
  const loggedCount = ex.loggedSets.length;
  const isComplete = loggedCount >= targetSets;

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', border: isComplete ? '1px solid var(--brand-cyan)' : 'none' }}>
      {/* Exercise Header */}
      <div style={{ 
        padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{ex.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hedef: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ex.sets} set</span> x <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ex.reps}</span> ({ex.rpe})
          </div>
        </div>
        
        <button 
          onClick={() => onSwapToggle(idx)}
          style={{ 
            background: isSwapping ? 'var(--border-color)' : 'transparent', 
            border: '1px solid var(--border-color)', 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)', 
            color: isSwapping ? 'var(--text-main)' : 'var(--text-muted)', 
            fontSize: '12px', 
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          Değiştir
        </button>
      </div>

      {/* Swapping Menu */}
      {isSwapping && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Alternatif Hareketler</div>
          {alternatives[0] === 'Bulunmuyor' ? (
             <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bu hareket için kayıtlı alternatif yok.</div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {alternatives.map((alt, aIdx) => (
                <button key={aIdx} onClick={() => onSwapConfirm(idx, alt)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {alt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logged Sets List */}
      <div style={{ padding: '1rem 1.25rem 0' }}>
        {ex.loggedSets.map((set, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
            <div style={{ width: '26px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }} className="font-mono">{set.set}</div>
            <div style={{ flex: 1, fontWeight: 700, fontSize: '1.1rem' }} className="font-mono">{set.kg} <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:400, fontFamily: 'var(--font-gaming)' }}>kg</span></div>
            <div style={{ flex: 1, fontWeight: 700, fontSize: '1.1rem' }} className="font-mono">{set.reps} <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:400, fontFamily: 'var(--font-gaming)' }}>tekrar</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px',
                borderRadius: '4px', color: getRpeColor(set.rpe),
                background: `${getRpeColor(set.rpe)}15`
              }}>
                RPE {set.rpe}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                {getRIR(set.rpe)} RIR
              </span>
            </div>
            <button onClick={() => onRemoveSet(idx, sIdx)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}>×</button>
          </div>
        ))}
      </div>

      {/* Rest Timer */}
      {isResting && (
        <RestTimer
          isActive={true}
          onComplete={onRestComplete}
          onSkip={onRestSkip}
        />
      )}

      {/* Input Area */}
      {!isComplete && (
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <input 
                type="number" 
                placeholder="Ağırlık (kg)" 
                value={currentInput?.kg || ''}
                onChange={(e) => onInputChange(idx, 'kg', e.target.value)}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input 
                type="number" 
                placeholder="Tekrar"
                value={currentInput?.reps || ''}
                onChange={(e) => onInputChange(idx, 'reps', e.target.value)}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
                className="font-mono"
              />
            </div>
            <button onClick={() => onLogSet(idx, ex.defaultRpe)} className="btn-primary" style={{ padding: '0 1.25rem', width: 'auto' }}>
              +
            </button>
          </div>
          {/* RPE Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginRight: '4px', whiteSpace: 'nowrap' }}>RPE</span>
            {RPE_OPTIONS.map(rpeVal => {
              const selected = (currentInput?.rpe ?? ex.defaultRpe) === rpeVal;
              return (
                <button
                  key={rpeVal}
                  onClick={() => onInputChange(idx, 'rpe', rpeVal)}
                  style={{
                    flex: 1, padding: '6px 0', border: 'none',
                    borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font-gaming)',
                    transition: 'all 0.15s ease',
                    background: selected ? getRpeColor(rpeVal) : 'var(--bg-panel-hover)',
                    color: selected ? '#000' : 'var(--text-muted)'
                  }}
                >
                  {rpeVal % 1 === 0 ? rpeVal : rpeVal.toFixed(1)}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
            {getRIR(currentInput?.rpe ?? ex.defaultRpe)} tekrar daha yapılabilir (RIR)
          </div>
        </div>
      )}
      
      {isComplete && (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--brand-cyan)', fontSize: '0.9rem', fontWeight: 600, backgroundColor: 'var(--brand-cyan-dim)' }}>
          ✓ Tüm setler tamamlandı
        </div>
      )}
    </div>
  );
});

const WorkoutTracker = ({ routineDay, onCompleteWorkout, onCancelWorkout }) => {
  // Deep clone routine to avoid mutating source prop
  const [exercises, setExercises] = useState(
    routineDay.exercises.map(ex => {
      const targetRpeMatch = ex.rpe?.match(/[\d.]+/);
      const defaultRpe = targetRpeMatch ? parseFloat(targetRpeMatch[0]) : 8;
      return { ...ex, loggedSets: [], defaultRpe };
    })
  );
  
  const [currentInputs, setCurrentInputs] = useState({});
  const [swappingExId, setSwappingExId] = useState(null);
  const [restTimerExIdx, setRestTimerExIdx] = useState(null);

  const handleInputChange = useCallback((exIndex, field, value) => {
    setCurrentInputs(prev => ({
      ...prev,
      [exIndex]: {
        ...prev[exIndex],
        [field]: value
      }
    }));
  }, []);

  const logSet = useCallback((exIndex, defaultRpe) => {
    let isValid = true;
    setCurrentInputs(prevInputs => {
      const kg = prevInputs[exIndex]?.kg || '';
      const reps = prevInputs[exIndex]?.reps || '';
      const rpe = prevInputs[exIndex]?.rpe ?? defaultRpe;

      if (!kg || !reps) {
        isValid = false;
        return prevInputs;
      }

      setExercises(prevExs => {
        const updated = [...prevExs];
        updated[exIndex] = { ...updated[exIndex] };
        updated[exIndex].loggedSets = [
          ...updated[exIndex].loggedSets, 
          { set: updated[exIndex].loggedSets.length + 1, kg, reps, rpe }
        ];
        return updated;
      });

      return {
        ...prevInputs,
        [exIndex]: {
          ...prevInputs[exIndex],
          kg: '',
          reps: ''
        }
      };
    });

    if (isValid) {
      setRestTimerExIdx(exIndex);
    } else {
      setTimeout(() => alert("Lütfen ağırlık ve tekrar verilerini girin."), 10);
    }
  }, []);

  const removeSet = useCallback((exIndex, setIndex) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exIndex] = { ...updated[exIndex] };
      updated[exIndex].loggedSets = updated[exIndex].loggedSets.filter((_, i) => i !== setIndex);
      return updated;
    });
  }, []);

  const swapExercise = useCallback((exIndex, newName) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exIndex] = { ...updated[exIndex], name: newName };
      return updated;
    });
    setSwappingExId(null);
  }, []);

  const toggleSwapMenu = useCallback((exIndex) => {
    setSwappingExId(prev => prev === exIndex ? null : exIndex);
  }, []);

  const clearRestTimer = useCallback(() => {
    setRestTimerExIdx(null);
  }, []);

  const finishWorkout = () => {
    const hasData = exercises.some(ex => ex.loggedSets.length > 0);
    if (!hasData) {
       alert("Lütfen bitirmeden önce en az bir set kaydedin.");
       return;
    }

    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('tr-TR', options);
    
    onCompleteWorkout({
      exercisesLogged: exercises,
      dateString: formattedDate,
      dayName: routineDay.day
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <button 
          onClick={onCancelWorkout} 
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-main)', 
            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0
          }}
          aria-label="Geri Dön"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
            {routineDay.day}
          </h2>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 600 }}>{routineDay.title}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {exercises.map((ex, idx) => {
          const alternatives = EXERCISE_ALTERNATIVES[ex.name] || EXERCISE_ALTERNATIVES[ex.name.replace(' / ', ' / ')] || ['Bulunmuyor'];
          
          return (
            <ExerciseRow
              key={idx}
              ex={ex}
              idx={idx}
              currentInput={currentInputs[idx]}
              isSwapping={swappingExId === idx}
              isResting={restTimerExIdx === idx}
              alternatives={alternatives}
              onSwapToggle={toggleSwapMenu}
              onSwapConfirm={swapExercise}
              onRemoveSet={removeSet}
              onLogSet={logSet}
              onInputChange={handleInputChange}
              onRestComplete={clearRestTimer}
              onRestSkip={clearRestTimer}
            />
          );
        })}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        <button onClick={finishWorkout} className="btn-primary" style={{ width: '100%', maxWidth: '300px', padding: '1.25rem', fontSize: '1.1rem' }}>
          Antrenmanı Bitir 🔥
        </button>
      </div>

    </div>
  );
};

export default WorkoutTracker;
