import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../core/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect to home (must be in useEffect, not during render)
  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Try username lookup first, fall back to treating input as email
        let loginEmail = null;
        
        const { data: foundEmail } = await supabase.rpc('get_email_by_username', {
          p_username: username
        });
        
        if (foundEmail) {
          loginEmail = foundEmail;
        } else if (username.includes('@')) {
          loginEmail = username;
        } else {
          throw new Error('Kullanıcı bulunamadı. E-posta ile de giriş yapabilirsiniz.');
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (error) throw error;
        // Navigation happens automatically via useEffect when session updates
      } else {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });
        if (error) throw error;
        
        setErrorMsg('Kayıt başarılı! Lütfen giriş yapın.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('[Auth] Error:', error);
      setErrorMsg(error.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render form if already authenticated
  if (session) return null;

  return (
    <div className="app-container" style={{ justifyContent: 'center' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh',
        padding: '20px'
      }} className="page-enter">
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* App Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Rekabetçi<span style={{ color: '#39FF14' }}>.</span>
            </div>
            <div style={{ 
              width: '40px', height: '2px', margin: '12px auto 0',
              background: 'linear-gradient(90deg, transparent, #39FF14, transparent)'
            }}/>
          </div>

          <h1 style={{ 
            textAlign: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            marginBottom: '1.5rem',
            color: 'var(--text-muted)'
          }}>
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h1>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div>
                <label className="auth-label">E-posta</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required={!isLogin}
                  className="auth-input"
                />
              </div>
            )}

            <div>
              <label className="auth-label">{isLogin ? 'Kullanıcı Adı veya E-posta' : 'Kullanıcı Adı'}</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'Kullanıcı adı veya e-posta' : 'Oyuncu adı (örn: ProLifer42)'}
                required
                className="auth-input"
              />
            </div>

            <div>
              <label className="auth-label">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="auth-input"
              />
            </div>

            {errorMsg && (
              <div style={{ 
                color: errorMsg.includes('başarılı') ? 'var(--neon-green)' : 'var(--color-danger)', 
                fontSize: '13px', 
                textAlign: 'center',
                marginTop: '8px' 
              }}>
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="auth-submit-btn"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Bekleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              className="auth-toggle-btn"
            >
              {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
