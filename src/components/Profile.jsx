import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import ActivityHeatmap from './ActivityHeatmap';
import RankCard from './RankCard';

const Profile = ({ activeProgram }) => {
  const { user } = useAuth();
  const { workouts, isLoading, error } = useUserData();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Yükleniyor...
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
      
      <div style={{ marginTop: '2rem' }}>
         <ActivityHeatmap 
           completedWorkouts={workouts} 
           activeProgram={activeProgram} 
         />
      </div>
    </>
  );
};

export default Profile;
