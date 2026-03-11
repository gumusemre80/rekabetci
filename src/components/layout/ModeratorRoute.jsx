import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ModeratorRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>Yükleniyor...</div>
      </div>
    );
  }

  if (user?.role !== 'moderator') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ModeratorRoute;
