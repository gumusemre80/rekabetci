import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../core/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBasicProfile = async (userId, email) => {
    // Try to fetch existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, account_type, elo_score, rank_title, is_verified, role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('[AuthContext] Profile fetch error:', error);
    }

    if (profile) {
      setUser({ ...profile, email });
    } else {
      // Profile doesn't exist — create it now
      console.log('[AuthContext] No profile found, creating one for', userId);
      const defaultUsername = email.split('@')[0];
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: defaultUsername,
          account_type: 'Standart',
          elo_score: 0,
          rank_title: 'Başlangıç',
          is_verified: false,
          role: 'user'
        }, { onConflict: 'id' })
        .select('id, username, account_type, elo_score, rank_title, is_verified, role')
        .maybeSingle();
      
      if (insertError) {
        console.error('[AuthContext] Profile upsert error:', insertError);
        // Use fallback
        setUser({ id: userId, username: defaultUsername, account_type: 'Standart', elo_score: 0, rank_title: 'Başlangıç', is_verified: false, role: 'user', email });
      } else if (newProfile) {
        setUser({ ...newProfile, email });
      } else {
        setUser({ id: userId, username: defaultUsername, account_type: 'Standart', elo_score: 0, rank_title: 'Başlangıç', is_verified: false, role: 'user', email });
      }
    }
    setIsLoading(false);
  };

  // Allow components to trigger a profile re-fetch
  const refreshProfile = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      await fetchBasicProfile(currentSession.user.id, currentSession.user.email);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchBasicProfile(session.user.id, session.user.email);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoading(true);
        fetchBasicProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    eloScore: user?.elo_score || 0,
    rankTitle: user?.rank_title || 'Başlangıç',
    isModerator: user?.role === 'moderator',
    isLoading,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
