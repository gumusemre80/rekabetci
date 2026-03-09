import React, { useState } from 'react';

const ProgramWizard = ({ onSaveProgram, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hedef: '',
    deneyim: '',
    ortam: '',
    frekans: '',
    sure: ''
  });
  const [result, setResult] = useState(null);

  // Advanced logic generation based on inputted metrics
  const generateProgram = (data) => {
    let splitType = '';
    let routine = [];
    let overloadRule = '';
    let restTime = '';
    
    // Determine Split Strategy based on Frequency & Goal
    if (data.frekans === 3) {
      splitType = 'Full Body (3 Gün)';
      restTime = data.hedef === 'Powerlifter (Maksimum Güç)' ? '3-5 dk' : '90-120 sn';
      overloadRule = data.hedef === 'Powerlifter (Maksimum Güç)' 
        ? 'Ana asansörlerde (Squat/Bench/DL) her hafta %2.5 ağırlık artır (Lineer Progresyon).' 
        : 'Belirlenen tekrar aralığına (örn. 8-12) ulaşıldığında ağırlığı 2.5kg artır (Çift İlerleme).';

      routine = [
        { day: 'Gün 1', title: 'Ağır İtme Odaklı', exercises: [
          { name: 'Barbell Back Squat', sets: '3-4', reps: data.hedef === 'Powerlifter (Maksimum Güç)' ? '5' : '6-8', rpe: 'RPE 8' },
          { name: 'Barbell Bench Press', sets: '3', reps: data.hedef === 'Powerlifter (Maksimum Güç)' ? '5' : '8-10', rpe: 'RPE 8' },
          { name: 'Barbell Row', sets: '3', reps: '8-10', rpe: 'RPE 7' },
          { name: 'Lateral Raise', sets: '3', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Rope Triceps Extension', sets: '2', reps: '12-15', rpe: 'RPE 9' }
        ]},
        { day: 'Gün 2', title: 'Ağır Çekme Odaklı', exercises: [
          { name: 'Deadlift', sets: '1-3', reps: data.hedef === 'Powerlifter (Maksimum Güç)' ? '3-5' : '6-8', rpe: 'RPE 8' },
          { name: 'Overhead Press', sets: '3', reps: '8-10', rpe: 'RPE 8' },
          { name: 'Lat Pulldown / Pull-up', sets: '3', reps: '8-12', rpe: 'RPE 8' },
          { name: 'Leg Curl', sets: '3', reps: '10-15', rpe: 'RPE 9' },
          { name: 'Barbell Biceps Curl', sets: '3', reps: '10-12', rpe: 'RPE 9' }
        ]},
        { day: 'Gün 3', title: 'Hipertrofi / Aksesuar', exercises: [
          { name: 'Leg Press / Front Squat', sets: '3', reps: '10-12', rpe: 'RPE 8' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-12', rpe: 'RPE 8' },
          { name: 'Seated Cable Row', sets: '3', reps: '10-12', rpe: 'RPE 8' },
          { name: 'Bulgarian Split Squat', sets: '2', reps: '10-15', rpe: 'RPE 8' },
          { name: 'Calf Raise', sets: '4', reps: '15-20', rpe: 'RPE 9' }
        ]}
      ];
    } else if (data.frekans === 4) {
      // Setup Upper / Lower Split
      splitType = 'Upper / Lower (4 Gün)';
      restTime = data.hedef === 'Bodybuilder (Hipertrofi)' ? '90-120 sn' : '2-3 dk';
      overloadRule = 'Ana hareketlerde (İlk 2 hareket) güce odaklan (RPE 8), izole hareketlerde tükenişe (RPE 9-10) yaklaş.';
      
      routine = [
        { day: 'Gün 1', title: 'Upper (Ağır)', exercises: [
          { name: 'Barbell Bench Press', sets: '4', reps: '4-6', rpe: 'RPE 8' },
          { name: 'Weighted Pull-up / Pulldown', sets: '3', reps: '6-8', rpe: 'RPE 8' },
          { name: 'Overhead Press', sets: '3', reps: '8-10', rpe: 'RPE 8' },
          { name: 'Cable Fly', sets: '2', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Skullcrushers', sets: '3', reps: '10-12', rpe: 'RPE 9' }
        ]},
        { day: 'Gün 2', title: 'Lower (Ağır)', exercises: [
          { name: 'Barbell Back Squat', sets: '4', reps: '4-6', rpe: 'RPE 8' },
          { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '8-10', rpe: 'RPE 8' },
          { name: 'Leg Press', sets: '3', reps: '10-12', rpe: 'RPE 8' },
          { name: 'Calf Raise', sets: '4', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Hanging Leg Raise', sets: '3', reps: 'AMRAP', rpe: 'RPE 9' }
        ]},
        { day: 'Gün 3', title: 'Upper (Hipertrofi)', exercises: [
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-12', rpe: 'RPE 8' },
          { name: 'Seated Cable Row', sets: '3', reps: '10-12', rpe: 'RPE 8' },
          { name: 'Dumbbell Lateral Raise', sets: '4', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Face Pulls', sets: '3', reps: '15-20', rpe: 'RPE 8' },
          { name: 'Dumbbell Biceps Curl', sets: '3', reps: '10-12', rpe: 'RPE 9' }
        ]},
        { day: 'Gün 4', title: 'Lower (Hipertrofi)', exercises: [
          { name: 'Leg Extension', sets: '3', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Lying Leg Curl', sets: '3', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Bulgarian Split Squat', sets: '3', reps: '10-12', rpe: 'RPE 8' },
          { name: 'Seated Calf Raise', sets: '3', reps: '15-20', rpe: 'RPE 9' },
          { name: 'Cable Crunch', sets: '3', reps: '15-20', rpe: 'RPE 9' }
        ]}
      ];
    } else {
      // 5-6 Days translates to Push Pull Legs (PPL)
      splitType = 'PPL - İt/Çek/Bacak';
      restTime = '90-120 sn';
      overloadRule = 'Kas hasarı yüksek olacağından, her mikro döngüde hacmi (set sayısını) değil, tekrarı/ağırlığı küçük oranda (1.25kg) artır.';
      
      routine = [
        { day: 'Push 1', exercises: [
          { name: 'Bench Press', sets: '3', reps: '5-8', rpe: 'RPE 8' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-12', rpe: 'RPE 8' },
          { name: 'Dumbbell Lateral Raise', sets: '4', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Triceps Pushdown', sets: '3', reps: '10-15', rpe: 'RPE 9' }
        ]},
        { day: 'Pull 1', exercises: [
          { name: 'Barbell Row', sets: '3', reps: '6-8', rpe: 'RPE 8' },
          { name: 'Lat Pulldown', sets: '3', reps: '10-12', rpe: 'RPE 8' },
          { name: 'Face Pull', sets: '3', reps: '15-20', rpe: 'RPE 8' },
          { name: 'EZ Bar Curl', sets: '3', reps: '10-12', rpe: 'RPE 9' }
        ]},
        { day: 'Legs 1', exercises: [
          { name: 'Barbell Squat', sets: '3', reps: '5-8', rpe: 'RPE 8' },
          { name: 'Romanian Deadlift', sets: '3', reps: '8-10', rpe: 'RPE 8' },
          { name: 'Leg Extension', sets: '3', reps: '12-15', rpe: 'RPE 9' },
          { name: 'Standing Calf Raise', sets: '4', reps: '15', rpe: 'RPE 9' }
        ]}
      ];
    }

    // Apply strict volume multipliers for beginners vs advanced
    let setsAdjustment = 0;
    if (data.deneyim === 'İlk 6 Ay (Yeni)') setsAdjustment = -1; // Protect from junk volume
    else if (data.deneyim === '3+ Yıl (İleri Seviye)') setsAdjustment = +1; // Needs more stimulus

    if (setsAdjustment !== 0) {
       routine = routine.map(day => ({
         ...day,
         exercises: day.exercises.map(ex => {
           let newSets = parseInt(ex.sets) + setsAdjustment;
           if (newSets <= 0) newSets = 1; // Minimum 1 set
           return { ...ex, sets: newSets.toString() };
         })
       }));
    }

    // Adapt for Environment (At Home/Dumbbell only)
    if (data.ortam === 'Sadece Ev / Dumbbell') {
       routine = routine.map(day => ({
         ...day,
         exercises: day.exercises.map(ex => {
           let newName = ex.name;
           if (newName.includes('Barbell')) newName = newName.replace('Barbell', 'Dumbbell');
           if (newName.includes('Cable')) newName = newName.replace('Cable', 'Ağırlıklı / Dumbbell');
           if (newName.includes('Lat Pulldown') || newName.includes('Pull-up')) newName = 'Dumbbell Row';
           if (newName.includes('Leg Press')) newName = 'Dumbbell Goblet Squat';
           if (newName.includes('Leg Extension')) newName = 'Dumbbell Lunge';
           if (newName.includes('Leg Curl')) newName = 'Dumbbell RDL';
           return { ...ex, name: newName };
         })
       }));
    }

    const programName = `${data.hedef.split(' ')[0]} - ${splitType} (${data.sure})`;

    return { 
      programName,
      duration: data.sure,
      splitType, 
      overloadRule,
      restTime,
      routine 
    };
  };

  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(() => setStep(step + 1), 300); // Auto-advance with slight delay for UX
  };

  const handleGenerate = () => {
    const generated = generateProgram({
      hedef: formData.hedef, 
      deneyim: formData.deneyim,
      ortam: formData.ortam,
      frekans: parseInt(formData.frekans),
      sure: formData.sure
    });
    setResult(generated);
  };

  const SelectionButton = ({ label, field, desc }) => (
    <button
      onClick={() => handleSelect(field, label)}
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius)',
        border: `1px solid ${formData[field] === label ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
        backgroundColor: formData[field] === label ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: formData[field] === label ? 'var(--accent)' : 'var(--text-main)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
        marginBottom: '0.75rem',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <span style={{ fontSize: '1.1rem', fontWeight: formData[field] === label ? 700 : 500 }}>{label}</span>
      {desc && <span style={{ fontSize: '0.85rem', color: formData[field] === label ? 'rgba(0,229,255,0.7)' : 'var(--text-muted)', marginTop: '4px' }}>{desc}</span>}
    </button>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Gelişmiş Sihirbaz</h2>
          <p style={{ color: 'var(--text-muted)' }}>Progressive overload odaklı profesyonel planın.</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px' }}
            aria-label="Kapat"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>

      {!result ? (
        <div className="card" style={{ padding: '2rem' }}>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map(s => (
              <div key={s} style={{ 
                height: '4px', flex: 1, borderRadius: '4px',
                backgroundColor: s <= step ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                transition: 'background-color 0.3s ease'
              }} />
            ))}
          </div>

          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Ana fitness hedefin nedir?</h3>
              <SelectionButton field="hedef" label="Bodybuilder (Hipertrofi)" desc="Maksimum kas büyümesi ve estetik odaklı." />
              <SelectionButton field="hedef" label="Powerlifter (Maksimum Güç)" desc="Ana liftlerde (Squat, Bench, DL) güç artışı." />
              <SelectionButton field="hedef" label="Hybrid (Güç & Estetik)" desc="Hem atletik performans hem kas gelişimi." />
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Antrenman geçmişin / deneyimin?</h3>
              <SelectionButton field="deneyim" label="İlk 6 Ay (Yeni)" desc="Lineer ilerleme yapılabilir, hareketleri öğreniyor." />
              <SelectionButton field="deneyim" label="6 Ay - 3 Yıl (Orta Seviye)" desc="Form oturdu, çift ilerleme (double progression) gerek." />
              <SelectionButton field="deneyim" label="3+ Yıl (İleri Seviye)" desc="Yüksek hacim uyumuna sahip, plato kırıcı periyotlama şart." />
              <button onClick={() => setStep(1)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                ← Geri
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Nerede antrenman yapacaksın?</h3>
              <SelectionButton field="ortam" label="Tam Donanımlı Gym" desc="Barbell, kablo, makineler." />
              <SelectionButton field="ortam" label="Sadece Ev / Dumbbell" desc="Alternatif egzersizler ve yüksek tekrar." />
              <button onClick={() => setStep(2)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                ← Geri
              </button>
            </div>
          )}

          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Haftada kaç gün gideceksin?</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[3, 4, 5, 6].map(gun => (
                  <button
                    key={gun}
                    onClick={() => handleSelect('frekans', gun)}
                    style={{
                      flex: '1 1 calc(50% - 0.5rem)',
                      padding: '1.25rem 0',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${formData.frekans === gun ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: formData.frekans === gun ? 'var(--accent)' : 'transparent',
                      color: formData.frekans === gun ? 'var(--bg-dark)' : 'var(--text-main)',
                      fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    {gun} Gün
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1.5rem' }}>
                <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                  ← Geri
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Programı kaç hafta uygulayacaksın?</h3>
              <SelectionButton field="sure" label="4 Hafta" desc="Kısa vadeli odak ve hızlı şoklama." />
              <SelectionButton field="sure" label="8 Hafta" desc="Standart ilerleme ve adaptasyon döngüsü." />
              <SelectionButton field="sure" label="12 Hafta" desc="Uzun vadeli istikrarlı büyüme ve periyotlama." />
              <button onClick={() => setStep(4)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                ← Geri
              </button>
            </div>
          )}

          {step === 6 && (
            <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                backgroundColor: 'rgba(0,229,255,0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Her Şey Hazır!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                {formData.hedef} hedefine uygun, {formData.frekans} günlük ve {formData.sure} sürecek profesyonel bir program oluşturmak üzereyiz.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(5)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                  ← Geri
                </button>
                <button onClick={handleGenerate} className="btn-primary" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Programı Oluştur 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden', animation: 'fadeIn 0.5s ease' }}>
          
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>{result.programName}</h3>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Sistem</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{result.splitType}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Önerilen Dinlenme</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{result.restTime}</div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--accent)' }}>Sürdürülebilir İlerleme Planı</div>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{result.overloadRule}</p>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antrenman Günleri</h4>
            
            {result.routine.map((dayPlan, idx) => (
              <div key={idx} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--accent)', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                    {dayPlan.day}
                  </div>
                  {dayPlan.title && <div style={{ fontSize: '1rem', fontWeight: 600 }}>{dayPlan.title}</div>}
                </div>
                
                {dayPlan.exercises && dayPlan.exercises.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Table Header */}
                    <div style={{ display: 'flex', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 0.5rem' }}>
                      <div style={{ flex: 3 }}>Hareket</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>Set</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>Tekrar</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>RPE</div>
                    </div>
                    
                    {/* Exercises */}
                    {dayPlan.exercises.map((ex, exIdx) => (
                      <div key={exIdx} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem 0.5rem', borderRadius: '4px' }}>
                        <div style={{ flex: 3, fontSize: '0.9rem', fontWeight: 500 }}>{ex.name}</div>
                        <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>{ex.sets}</div>
                        <div style={{ flex: 1, textAlign: 'center', color: 'var(--accent)' }}>{ex.reps}</div>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>{ex.rpe}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

           <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => { setStep(1); setResult(null); }} className="btn-secondary" style={{ flex: 1 }}>
                 Vazgeç & Yeniden Başla
              </button>
              <button 
                onClick={() => onSaveProgram && onSaveProgram(result)} 
                className="btn-primary" 
                style={{ flex: 2, backgroundColor: 'var(--color-success)', color: '#000' }}
              >
                 Bu Programı Kullan & Başla
              </button>
           </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramWizard;
