import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import BADGES, { BADGE_CATEGORIES, CATEGORY_EMOJIS } from '../../core/badgeDefinitions';

const BadgesPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [earnedKeys, setEarnedKeys] = useState(new Set());
  const [earnedDates, setEarnedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    fetchBadges();
  }, [session?.user?.id]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('badge_key, earned_at')
      .eq('user_id', session.user.id);

    if (data) {
      setEarnedKeys(new Set(data.map(b => b.badge_key)));
      const dates = {};
      data.forEach(b => { dates[b.badge_key] = b.earned_at; });
      setEarnedDates(dates);
    }
    setLoading(false);
  };

  const earnedCount = earnedKeys.size;
  const totalCount = BADGES.length;

  if (loading) {
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Rozetler</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Rozetler</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {earnedCount}/{totalCount} kazanıldı
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', border: '1px solid var(--border-color)',
            color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-gaming)'
          }}
        >
          ← Profil
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            width: `${(earnedCount / totalCount) * 100}%`,
            background: 'linear-gradient(90deg, var(--neon-green), #28cc10)',
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Badge Categories */}
      {BADGE_CATEGORIES.map(cat => {
        const catBadges = BADGES.filter(b => b.category === cat);
        const catEarned = catBadges.filter(b => earnedKeys.has(b.key)).length;

        return (
          <div key={cat} style={{ marginBottom: '2rem' }}>
            {/* Category Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {CATEGORY_EMOJIS[cat]} {cat}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {catEarned}/{catBadges.length}
              </div>
            </div>

            {/* Badge Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {catBadges.map(badge => {
                const isEarned = earnedKeys.has(badge.key);
                const date = earnedDates[badge.key];
                return (
                  <div
                    key={badge.key}
                    className="card"
                    style={{
                      padding: '16px 10px', textAlign: 'center', margin: 0,
                      border: isEarned ? '1px solid rgba(57,255,20,0.15)' : '1px solid var(--border-color)',
                      opacity: isEarned ? 1 : 0.4,
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Emoji */}
                    <div style={{
                      fontSize: '1.8rem', marginBottom: '8px',
                      filter: isEarned ? 'none' : 'grayscale(1)',
                      transition: 'filter 0.3s ease'
                    }}>
                      {badge.emoji}
                    </div>
                    {/* Name */}
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.3,
                      color: isEarned ? 'var(--text-main)' : 'var(--text-muted)'
                    }}>
                      {badge.name}
                    </div>
                    {/* Description or Date */}
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      {isEarned
                        ? new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                        : badge.description
                      }
                    </div>
                    {/* Lock overlay */}
                    {!isEarned && (
                      <div style={{
                        position: 'absolute', top: '6px', right: '6px',
                        fontSize: '0.6rem', opacity: 0.4
                      }}>
                        🔒
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgesPage;
