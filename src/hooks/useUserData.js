import { useState, useEffect } from 'react';
import { supabase } from '../core/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useUserData = () => {
  const { session, user: authUser } = useAuth();
  
  const [workouts, setWorkouts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user) {
      setWorkouts([]);
      setUserData(null);
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userId = session.user.id;

        // Fetch Workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select(`
            *,
            workout_logs (
              *,
              exercises ( name_tr )
            )
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (workoutsError) throw workoutsError;

        if (workoutsData) {
          const formatted = workoutsData.map(w => {
            const parts = w.date.split('-');
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            
            const exMap = {};
            w.workout_logs.forEach(log => {
                const name = log.exercises?.name_tr || 'Bilinmeyen Hareket';
                if (!exMap[name]) exMap[name] = { name, loggedSets: [] };
                exMap[name].loggedSets.push({ set: log.set_number, kg: log.weight_kg, reps: log.reps });
            });
            
            Object.values(exMap).forEach(ex => ex.loggedSets.sort((a,b) => a.set - b.set));

            return {
                id: w.id,
                programName: w.program_name,
                dayName: w.day_name,
                dateString: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
                safeCompareString: `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
                analysis: { totalVolume: w.total_volume },
                exercisesLogged: Object.values(exMap)
            };
          });
          setWorkouts(formatted);
        }
        
        // Return combined authUser and workouts
        setUserData(authUser);
        
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run when authUser is fully loaded by context
    if (authUser) {
       fetchAllData();
    }

  }, [session?.user?.id, authUser?.elo_score]); // Refetch only when user ID or ELO changes

  // Exposed for optimistic updates from components like WorkoutLogger
  const addWorkoutOptimistic = (newWorkout) => {
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  return { userData, workouts, isLoading, error, addWorkoutOptimistic };
};
