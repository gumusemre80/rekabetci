import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../hooks/useUserData';
import { supabase } from '../../core/supabaseClient';
import ActivityHeatmap from '../stats/ActivityHeatmap';
import RankCard from '../gamification/RankCard';

const Profile = () => {
  const { user, session } = useAuth();
  const { workouts, isLoading, error } = useUserData();
  const navigate = useNavigate();
  const [activeProgram, setActiveProgram] = useState(null);

  // Load the user's active program for heatmap scheduling  
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchProgram = async () => {
      const { data } = await supabase
        .from('user_programs')
        .select('program_data')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data?.program_data) {
        setActiveProgram(data.program_data);
      }
    };
    
    fetchProgram();
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '56px', height: '56px' }}></div>
          <div style={{ marginLeft: '14px', flex: 1 }}>
            <div className="skeleton skeleton-text-lg" style={{ width: '120px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '80px' }}></div>
          </div>
        </div>
        <div className="skeleton skeleton-block" style={{ height: '160px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#FF6961' }}>
        Veriler alınırken bir hata oluştu: {error}
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <RankCard 
        username={user.username}
        eloScore={user.elo_score}
        rankTitle={user.rank_title}
        accountType={user.account_type}
        isVerified={user.is_verified}
      />
      
      <button
        onClick={() => navigate('/stats')}
        className="card card-glow"
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', marginTop: '1rem', cursor: 'pointer',
          border: '1px solid var(--border-color)', textAlign: 'left', width: '100%'
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neon-green)' }}>İstatistikler</span>
        <span style={{ color: 'var(--text-muted)' }}>→</span>
      </button>

      <button
        onClick={() => navigate('/1rm')}
        className="card card-glow"
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', marginTop: '0.5rem', cursor: 'pointer',
          border: '1px solid var(--border-color)', textAlign: 'left', width: '100%'
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neon-green)' }}>Tahmini Maks</span>
        <span style={{ color: 'var(--text-muted)' }}>→</span>
      </button>

      <button
        onClick={() => navigate('/badges')}
        className="card card-glow"
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', marginTop: '0.5rem', cursor: 'pointer',
          border: '1px solid var(--border-color)', textAlign: 'left', width: '100%'
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neon-green)' }}>Rozetler</span>
        <span style={{ color: 'var(--text-muted)' }}>→</span>
      </button>

      <div style={{ marginTop: '1rem' }}>
         <ActivityHeatmap 
           completedWorkouts={workouts} 
           activeProgram={activeProgram} 
         />
      </div>
    </>
  );
};

export default Profile;
