import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/theme.css';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Profile from './components/Profile';
import WorkoutLogger from './components/WorkoutLogger';
import Leaderboard from './components/Leaderboard';
import CoachPanel from './components/CoachPanel';
import ModeratorRoute from './components/ModeratorRoute';
import Settings from './components/Settings';
import ProgramOverview from './components/ProgramOverview';
import StatsPage from './components/StatsPage';
import OneRepMaxCalc from './components/OneRepMaxCalc';
import BadgesPage from './components/BadgesPage';

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Auth />} />

            {/* Protected Routes — requires authentication */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Profile />} />
                <Route path="workout" element={<WorkoutLogger />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route element={<ModeratorRoute />}>
                  <Route path="coach" element={<CoachPanel />} />
                </Route>
                <Route path="settings" element={<Settings />} />
                <Route path="program" element={<ProgramOverview />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="1rm" element={<OneRepMaxCalc />} />
                <Route path="badges" element={<BadgesPage />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;
