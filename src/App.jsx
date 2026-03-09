import React, { useState } from 'react';
import './styles/theme.css';
import { supabase } from './core/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './components/Profile';
import WorkoutLogger from './components/WorkoutLogger';
import CoachPanel from './components/CoachPanel';
import Leaderboard from './components/Leaderboard';
import Auth from './components/Auth';

const MainApp = () => {
  const { session, user, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profil');
  const [activeProgram, setActiveProgram] = useState({
    title: "Powerlifter - Full Body",
    splitType: "4 Gün / Hafta", // Important for heuristic calendar checks
    duration: "8 Hafta",
    routine: [] // Simplified for mock
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'profil':
        return <Profile activeProgram={activeProgram} />;
      case 'antrenman':
        // WorkoutLogger will be responsible for fetching its own data or using useUserData
        // I am passing the activeProgram down since it acts as 'global app configuration'
        return <WorkoutLogger 
                  activeProgram={activeProgram} 
                  onUpdateProgram={(prog) => setActiveProgram(prog)} 
               />;
      case 'liderlik':
        return <Leaderboard />;
      case 'hoca':
        return <CoachPanel />;
      default:
        return <Profile activeProgram={activeProgram} />;
    }
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>Rekabetçi Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <Auth onLoginSuccess={(u) => console.log('Login success handled by listener')} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>Profil Bekleniyor...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{ padding: '2rem 1rem 1rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ 
          margin: 0, 
        }}>
          Rekabetçi.
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {activeTab === 'hoca' && <span style={{fontSize:'0.8rem', color:'var(--color-danger)'}}>Moderatör</span>}
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-muted)', 
              padding: '4px 8px', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Çıkış
          </button>
        </div>
      </header>

      <main className="content-area">
        {renderContent()}
      </main>

      <nav>
        <button 
          className={`nav-btn ${activeTab === 'profil' ? 'active' : ''}`} 
          onClick={() => setActiveTab('profil')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'antrenman' ? 'active' : ''}`} 
          onClick={() => setActiveTab('antrenman')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'liderlik' ? 'active' : ''}`} 
          onClick={() => setActiveTab('liderlik')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'hoca' ? 'active' : ''}`} 
          onClick={() => setActiveTab('hoca')}
          style={{ color: activeTab === 'hoca' ? 'var(--color-danger)' : 'var(--text-muted)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </button>
      </nav>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
