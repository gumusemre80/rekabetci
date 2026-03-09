import React, { useState } from 'react';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('rekabetci');

  const leaderboardData = {
    rekabetci: [],
    genel: []
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: 'var(--gold)', fontSize: '1.25rem' };
    if (rank === 2) return { color: 'var(--silver)', fontSize: '1.1rem' };
    if (rank === 3) return { color: 'var(--bronze)', fontSize: '1.1rem' };
    return { color: 'var(--text-muted)' };
  };

  const getRankData = (title) => {
    switch(title) {
      case 'Şampiyon':
        return { color: '#00e5ff', icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/> };
      case 'Usta':
        return { color: '#a855f7', icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/> };
      case 'Altın':
        return { color: 'var(--gold)', icon: <circle cx="12" cy="12" r="10" /> };
      case 'Gümüş':
        return { color: 'var(--silver)', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> };
      case 'Bronz':
        return { color: 'var(--bronze)', icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/> };
      default:
        return { color: 'var(--text-muted)', icon: <circle cx="12" cy="12" r="10" /> };
    }
  };

  const renderList = (data) => {
    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          Henüz sıralamaya giren kimse yok.
        </div>
      );
    }
    return (
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((user) => {
          const rankData = getRankData(user.title);
          
          return (
            <div key={user.rank} className="card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', margin: 0 }}>
              <div style={{ width: '40px', fontWeight: 700, ...getRankStyle(user.rank) }}>
                #{user.rank}
              </div>
              
              <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{user.username}</div>
                <div style={{ 
                  fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', 
                  letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px',
                  marginTop: '2px' 
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={rankData.color} stroke={rankData.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {rankData.icon}
                  </svg>
                  {user.title} Ligi
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {user.elo}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Liderlik Tablosu</h2>

      <div style={{ 
        display: 'flex', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '0.25rem' 
      }}>
        <button 
          onClick={() => setActiveTab('rekabetci')}
          style={{
            flex: 1, 
            padding: '0.75rem', 
            backgroundColor: activeTab === 'rekabetci' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: activeTab === 'rekabetci' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.85rem'
          }}
        >
          Küresel Rekabetçi
        </button>
        <button 
          onClick={() => setActiveTab('genel')}
          style={{
            flex: 1, 
            padding: '0.75rem', 
            backgroundColor: activeTab === 'genel' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: activeTab === 'genel' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.85rem'
          }}
        >
          Genel Klasman
        </button>
      </div>

      {activeTab === 'rekabetci' ? renderList(leaderboardData.rekabetci) : renderList(leaderboardData.genel)}
    </div>
  );
};

export default Leaderboard;
