import React, { useState } from 'react';

const CoachPanel = () => {
  const [submissions, setSubmissions] = useState([]);

  const [ratings, setRatings] = useState({});

  const handleRatingChange = (id, rating) => {
    setRatings({ ...ratings, [id]: rating });
  };

  const handleApprove = (id, weight, reps) => {
    const coachRating = ratings[id];
    if (!coachRating || coachRating < 1 || coachRating > 10) {
      alert("Lütfen 1-10 arası bir teknik puanı girin.");
      return;
    }
    
    // Formula: eloGained = weight * reps * 0.033 * coach_rating
    const eloGained = Math.round(weight * reps * 0.033 * coachRating);
    
    alert(`Video Onaylandı. Kullanıcıya ${eloGained} ELO eklendi.`);
    
    setSubmissions(submissions.filter(sub => sub.id !== id));
  };

  const handleReject = (id) => {
    alert("Video reddedildi. Form yönergelere uymuyor.");
    setSubmissions(submissions.filter(sub => sub.id !== id));
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Onay Bekleyenler</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {submissions.length} kayıt
        </div>
      </div>

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
          İncelenecek yeni video bulunmuyor.
        </div>
      ) : (
        submissions.map((sub) => (
          <div key={sub.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{sub.username} <span style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>({sub.exercise})</span></h3>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ağırlık</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.weight} <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>kg</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tekrar</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.reps}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', 
                  fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase'
                }}>
                  Teknik Puanı (1-10)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i+1}
                      onClick={() => handleRatingChange(sub.id, i+1)}
                      style={{
                        flex: 1, padding: '0.75rem 0', borderRadius: 'var(--radius-sm)',
                        border: '1px solid ' + (ratings[sub.id] === i+1 ? 'var(--accent)' : 'rgba(255,255,255,0.1)'),
                        backgroundColor: ratings[sub.id] === i+1 ? 'var(--accent)' : 'transparent',
                        color: ratings[sub.id] === i+1 ? 'var(--bg-dark)' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: 600, transition: 'all 0.1s ease'
                      }}
                    >
                      {i+1}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                 <button 
                  className="btn-secondary" 
                  style={{ flex: 1, color: 'var(--color-danger)', borderColor: 'rgba(255,69,58,0.3)' }}
                  onClick={() => handleReject(sub.id)}
                >
                  Reddet
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 2, backgroundColor: 'var(--color-success)', color: '#000' }}
                  onClick={() => handleApprove(sub.id, sub.weight, sub.reps)}
                >
                  Onayla
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CoachPanel;
