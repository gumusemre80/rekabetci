import React, { useState } from 'react';
import { supabase } from '../core/supabaseClient';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(''); // New state for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Sign In via Username
        // 1. Get the email associated with the username using our secure RPC
        const { data: foundEmail, error: rpcError } = await supabase.rpc('get_email_by_username', {
          p_username: username
        });
        
        if (rpcError) throw rpcError;
        if (!foundEmail) {
           throw new Error('Kullanıcı bulunamadı.'); // User not found
        }

        // 2. Sign in with the retrieved email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: foundEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username // Save custom username to user metadata
            }
          }
        });
        if (error) throw error;
        
        setErrorMsg('Kayıt başarılı! Lütfen giriş yapın.');
        setIsLogin(true); // Switch to login after successful registration
      }
    } catch (error) {
      setErrorMsg(error.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      animation: 'fadeIn 0.3s ease-out',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '32px', 
          fontWeight: 800, 
          marginBottom: '2rem' 
        }}>
          {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </h1>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '12px', 
                fontWeight: 700, 
                color: 'var(--text-muted)',
                textTransform: 'uppercase' 
              }}>
                E-posta
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#000000',
                  border: '1px solid #2C2C2E',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontFamily: 'var(--font-gaming)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '12px', 
              fontWeight: 700, 
              color: 'var(--text-muted)',
              textTransform: 'uppercase' 
            }}>
              Kullanıcı Adı
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Oyuncu adı (örn: ProLifer42)"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#000000',
                border: '1px solid #2C2C2E',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '15px',
                fontFamily: 'var(--font-gaming)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '12px', 
              fontWeight: 700, 
              color: 'var(--text-muted)',
              textTransform: 'uppercase' 
            }}>
              Şifre
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#000000',
                border: '1px solid #2C2C2E',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '15px',
                fontFamily: 'var(--font-gaming)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
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
            style={{
              marginTop: '1.5rem',
              backgroundColor: '#39FF14',
              color: '#000000',
              border: 'none',
              borderRadius: '0px', 
              padding: '16px',
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: 'var(--font-gaming)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Bekleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
