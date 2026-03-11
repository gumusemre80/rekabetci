import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, eloScore, rankTitle } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="skeleton skeleton-text-lg" style={{ width: '160px' }}></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{ 
        padding: '1.5rem 1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Rekabetçi<span style={{ color: 'var(--neon-green)' }}>.</span>
        </h1>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{eloScore}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>ELO</span>
        </div>
      </header>

      <main className="content-area">
        <Outlet />
      </main>

      <nav>
        {/* Profile */}
        <NavLink to="/" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} end>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </NavLink>

        {/* Workout — dumbbell */}
        <NavLink to="/workout" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 7v10M18 7v10M4 9v6M20 9v6M6 12h12"/>
            <rect x="2" y="10" width="2" height="4" rx="0.5"/>
            <rect x="20" y="10" width="2" height="4" rx="0.5"/>
          </svg>
        </NavLink>

        {/* Leaderboard — trophy */}
        <NavLink to="/leaderboard" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
        </NavLink>

        {/* Moderator — shield */}
        {user.role === 'moderator' && (
          <NavLink to="/coach" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} style={({ isActive }) => ({ color: isActive ? 'var(--color-danger)' : 'var(--text-muted)' })}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </NavLink>
        )}

        {/* Settings — gear */}
        <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
