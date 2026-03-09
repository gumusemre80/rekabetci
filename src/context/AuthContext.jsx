import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../core/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // We only fetch the basic profile to provide ELO and Rank globally.
  // We leave the heavy workout fetching to the useUserData hook.
  const fetchBasicProfile = async (userId, email) => {
    const { data: profile } = await supabase.from('profiles').select('id, username, account_type, elo_score, rank_title, is_verified').eq('id', userId).single();
    if (profile) {
      setUser({ ...profile, email });
    } else {
      // Fallback if profile not created yet
      setUser({ 
        username: email.split('@')[0], 
        account_type: 'Standart', 
        elo_score: 0, 
        rank_title: 'Başlangıç', 
        is_verified: false,
        email 
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchBasicProfile(session.user.id, session.user.email);
      } else {
        setIsLoading(false);
      }
    });

    // Listen to changes
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
    isLoading
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
