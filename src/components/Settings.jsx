import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../core/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, session, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === user.username) {
      setEditingUsername(false);
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    const { error } = await supabase.rpc('update_username', {
      p_user_id: session.user.id,
      p_new_username: newUsername.trim()
    });

    if (error) {
      setMessage('Bir hata oluştu: ' + error.message);
    } else {
      setMessage('Kullanıcı adı güncellendi!');
      setEditingUsername(false);
      // Reload to pick up the change everywhere
      setTimeout(() => window.location.reload(), 300);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Ayarlar</h2>

      {/* Profile Info Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Profil Bilgileri
        </div>

        {/* Username Row */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Kullanıcı Adı</div>
          {editingUsername ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', fontSize: '0.95rem' }}
                autoFocus
              />
              <button 
                onClick={handleSaveUsername} 
                disabled={saving}
                className="btn-primary" 
                style={{ width: 'auto', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                {saving ? '...' : 'Kaydet'}
              </button>
              <button 
                onClick={() => { setEditingUsername(false); setNewUsername(user.username); }}
                className="btn-secondary"
                style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              >
                İptal
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{user.username}</span>
              <button 
                onClick={() => setEditingUsername(true)}
                style={{ 
                  background: 'transparent', border: '1px solid var(--border-color)', 
                  color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem', cursor: 'pointer' 
                }}
              >
                Düzenle
              </button>
            </div>
          )}
        </div>

        {/* Account Type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Hesap Türü</div>
            <span style={{ fontWeight: 600 }}>{user.account_type}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Doğrulama</div>
            {user.is_verified ? (
              <span className="badge badge-verified">✓ Onaylı</span>
            ) : (
              <span className="badge" style={{ border: '1px solid var(--text-muted)' }}>Bekliyor</span>
            )}
          </div>
        </div>

        {/* ELO */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ELO Puanı</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{user.elo_score}</span>
            <span style={{ color: 'var(--text-muted)' }}>({user.rank_title} Lig)</span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ 
          padding: '12px', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem',
          color: message.includes('güncellendi') ? 'var(--color-success)' : 'var(--color-danger)', 
        }}>
          {message}
        </div>
      )}

      {/* Sign Out */}
      <button 
        onClick={handleSignOut}
        className="btn-secondary"
        style={{ 
          width: '100%', marginTop: '1rem', padding: '14px',
          color: 'var(--color-danger)', borderColor: 'rgba(255,69,58,0.3)' 
        }}
      >
        Çıkış Yap
      </button>

      {/* App Info */}
      <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        Gym-Gamer (Rekabetçi) v1.0.0
      </div>
    </div>
  );
};

export default Settings;
