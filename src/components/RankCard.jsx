import React, { useState, useEffect } from 'react';

const RankCard = ({ eloScore, rankTitle, accountType, isVerified, username }) => {
  const [displayElo, setDisplayElo] = useState(0);

  // Animated count-up effect for ELO
  useEffect(() => {
    if (!eloScore) return;
    const duration = 600;
    const steps = 30;
    const increment = eloScore / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= eloScore) {
        setDisplayElo(eloScore);
        clearInterval(timer);
      } else {
        setDisplayElo(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [eloScore]);

  // Determine rank ring color
  const getRingClass = () => {
    if (eloScore >= 1500) return 'rank-ring-gold';
    if (eloScore >= 800) return 'rank-ring-silver';
    if (eloScore >= 300) return 'rank-ring-bronze';
    return 'rank-ring-default';
  };

  return (
    <div className="page-enter">
      {/* User Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div 
          className={getRingClass()}
          style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em',
            flexShrink: 0
          }}
        >
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
        <div style={{ marginLeft: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{username}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            {accountType} Kullanıcı
          </div>
        </div>
      </div>
      
      {/* ELO Card */}
      <div className="card shimmer-border card-glow" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="stat-label" style={{ marginTop: 0 }}>Gym Reytingi</div>
          
          <div style={{ margin: '0.75rem 0' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {displayElo}
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.85rem', fontWeight: 500 }}>ELO</span>
          </div>

          <div style={{ 
            display: 'flex', justifyContent: 'space-between', 
            marginTop: '1.25rem', paddingTop: '1rem', 
            borderTop: '1px solid rgba(255,255,255,0.06)' 
          }}>
            <div>
              <div className="stat-label">Aşama</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rankTitle} Lig</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="stat-label">Hesap Durumu</div>
              {isVerified ? (
                <span className="badge badge-verified">✓ Onaylı</span>
              ) : (
                <span className="badge" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Bekliyor</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankCard;
