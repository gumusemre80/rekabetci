import React, { useState } from 'react';

const ActivityHeatmap = ({ completedWorkouts = [], activeProgram }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  // Helper to get array of days in the currently viewed month
  const getDaysInMonth = (offset) => {
    const today = new Date();
    // Use offset to shift months (0 is current month, -1 is last month, etc)
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Get total days in this month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Get starting day of the week (0=Sun, 1=Mon...6=Sat)
    let startDayOfWeek = new Date(year, month, 1).getDay();
    // Convert to Monday-start schedule (0=Mon, 1=Tue...6=Sun)
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];
    // Pad empty slots before 1st of the month
    for (let i = 0; i < startDayOfWeek; i++) {
       days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
       days.push(new Date(year, month, i));
    }
    
    return { days, monthName: targetDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) };
  };

  const { days: calendarDays, monthName } = getDaysInMonth(currentMonthOffset);

  // Heuristic rule for scheduled workout days based on program split Type
  const isScheduled = (date) => {
    if (!activeProgram) return false;
    const dayIndex = date.getDay(); // 0 is Sunday, 1 is Mon...
    
    if (activeProgram.splitType.includes('3 Gün')) {
      return [1, 3, 5].includes(dayIndex);
    }
    if (activeProgram.splitType.includes('4 Gün')) {
      return [1, 2, 4, 5].includes(dayIndex);
    }
    return [1, 2, 3, 4, 5, 6].includes(dayIndex);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Aktivite Takvimi</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginRight: '8px' }}>{monthName}</span>
            <button 
              onClick={() => { setSelectedDay(null); setCurrentMonthOffset(prev => prev - 1); }}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            >
              &lt; Önceki
            </button>
            <button 
              onClick={() => { setSelectedDay(null); setCurrentMonthOffset(prev => Math.min(0, prev + 1)); }}
              className="btn-secondary"
              disabled={currentMonthOffset === 0}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', opacity: currentMonthOffset === 0 ? 0.5 : 1 }}
            >
              Sonraki &gt;
            </button>
          </div>
        </div>
        
        {/* Heatmap Grid Component */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '4px',
            marginBottom: '8px'
          }}>
             {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
               <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d}</div>
             ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {calendarDays.map((dateObj, i) => {
              if (!dateObj) {
                return <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />;
              }
              
              const options = { day: 'numeric', month: 'long', year: 'numeric' };
              const formattedBlockDate = dateObj.toLocaleDateString('tr-TR', options);
              
              // Safe universal string comparison (YYYY-MM-DD)
              const safeCompareString = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
              
              const today = new Date();
              today.setHours(0,0,0,0);
              const isPast = dateObj < today;
              const isToday = dateObj.getTime() === today.getTime();
              
              const matchingWorkoutIndex = completedWorkouts.findIndex(w => w.safeCompareString === safeCompareString);
              const hasWorkout = matchingWorkoutIndex !== -1;
              const isWorkoutScheduled = isScheduled(dateObj);
              
              let blockCategory = 'future'; // Pale gray
              let bgColor = 'rgba(255,255,255,0.05)';
              let borderColor = 'transparent';
              
              if (hasWorkout) {
                 blockCategory = 'completed'; // Pastel Blue
                 bgColor = '#B3EBF2';
              } else if (isPast && isWorkoutScheduled) {
                 blockCategory = 'missed'; // Pastel Red
                 bgColor = '#FF6961';
              } else if (isPast || (isToday && !isWorkoutScheduled)) {
                 blockCategory = 'rest'; // Beyaz
                 bgColor = '#FFFFFF';
              }
              
              const isSelected = selectedDay?.dateString === formattedBlockDate;
              if (isSelected && blockCategory !== 'rest') {
                 borderColor = 'var(--accent)';
              }

              return (
                <button
                  key={i}
                  title={formattedBlockDate}
                  onClick={() => setSelectedDay(isSelected ? null : { 
                     dateString: formattedBlockDate, 
                     category: blockCategory, 
                     workoutData: hasWorkout ? completedWorkouts[matchingWorkoutIndex] : null 
                  })}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '4px',
                    border: `1px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    opacity: isSelected ? 1 : 0.85,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: blockCategory === 'completed' 
                           ? '#000' 
                           : (blockCategory === 'rest' || blockCategory === 'future') ? 'var(--text-muted)' : '#FFF',
                    fontSize: '0.7rem',
                    fontWeight: isToday ? 800 : 500
                  }}
                >
                  {dateObj.getDate()}
                </button>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width:'8px', height:'8px', backgroundColor:'#B3EBF2', borderRadius:'2px'}}/> Tamamlandı</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width:'8px', height:'8px', backgroundColor:'#FFFFFF', borderRadius:'2px'}}/> Dinlenme</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width:'8px', height:'8px', backgroundColor:'#FF6961', borderRadius:'2px'}}/> Kaçırıldı</div>
          </div>
        </div>

        {/* Detailed Selected Workout Modal/Card */}
        {selectedDay && (
          <div className="card" style={{ marginTop: '1rem', padding: '0', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {selectedDay.dateString}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                  {selectedDay.category === 'completed' && selectedDay.workoutData ? selectedDay.workoutData.programName : 'Günlük Durum'}
                </div>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                aria-label="Kapat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
               {selectedDay.category === 'missed' && (
                 <div style={{ color: '#FF6961', fontSize: '1rem', fontWeight: 600, textAlign: 'center', padding: '1rem 0' }}>
                   Bu antrenmanı kaçırdın. Pes etme, yarın telafi edebilirsin! 💥
                 </div>
               )}

               {selectedDay.category === 'rest' && (
                 <div style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, textAlign: 'center', padding: '1rem 0' }}>
                   Dinlenme günü. Kasların gelişiyor! 🧘‍♂️
                 </div>
               )}
               
               {selectedDay.category === 'future' && (
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                   Gelecek planlaması.
                 </div>
               )}

              {selectedDay.category === 'completed' && selectedDay.workoutData && (
                <>
                  {(selectedDay.workoutData.analysis?.praises?.length > 0 || selectedDay.workoutData.analysis?.suggestions?.length > 0) && (
                    <div style={{ marginBottom: '1.5rem', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Analiz Özeti</h4>
                      {selectedDay.workoutData.analysis.praises?.map((p, i) => (
                        <div key={`p-${i}`} style={{ fontSize: '0.9rem', color: 'var(--color-success)', marginBottom: '6px' }}>⭐ {p}</div>
                      ))}
                      {selectedDay.workoutData.analysis.suggestions?.map((s, i) => (
                        <div key={`s-${i}`} style={{ fontSize: '0.9rem', color: 'var(--color-warning)', marginTop: selectedDay.workoutData.analysis.praises?.length > 0 ? '8px' : '0' }}>📈 {s}</div>
                      ))}
                    </div>
                  )}

                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Egzersiz Kayıtları</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedDay.workoutData.exercisesLogged?.map((ex, exIdx) => {
                      if (!ex.loggedSets || ex.loggedSets.length === 0) return null;
                      return (
                        <div key={exIdx} style={{ fontSize: '0.9rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{ex.name}</div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {ex.loggedSets.map(s => `${s.kg}kg x ${s.reps}`).join(', ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default ActivityHeatmap;
