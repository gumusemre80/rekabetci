import React from 'react';

const RankCard = ({ eloScore, rankTitle, accountType, isVerified, username }) => {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', 
          backgroundColor: 'var(--accent)', color: 'var(--bg-dark)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '1.5rem', fontWeight: 'bold' 
        }}>
          {username ? username.charAt(0) : '?'}
        </div>
        <div style={{ marginLeft: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{username}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {accountType} Kullanıcı
          </div>
        </div>
      </div>
      
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Gym Reytingi
        </div>
        
        <div style={{ margin: '1rem 0' }}>
          <span style={{ fontSize: '4rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
            {eloScore}
          </span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>ELO</span>
        </div>

        <div style={{ 
          display: 'flex', justifyContent: 'space-between', 
          marginTop: '2rem', paddingTop: '1.5rem', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Aşama</div>
            <div style={{ fontWeight: 600 }}>{rankTitle} Lig</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Hesap Durumu</div>
            {isVerified ? (
              <span className="badge badge-verified">✓ Onaylı</span>
            ) : (
              <span className="badge" style={{ border: '1px solid var(--text-muted)' }}>Bekliyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankCard;
