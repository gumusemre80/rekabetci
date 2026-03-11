import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/theme.css';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/layout/ErrorBoundary';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Auth from './components/auth/Auth';
import ModeratorRoute from './components/layout/ModeratorRoute';

// Lazy loaded page components
const Profile = React.lazy(() => import('./components/user/Profile'));
const WorkoutLogger = React.lazy(() => import('./components/workout/WorkoutLogger'));
const Leaderboard = React.lazy(() => import('./components/gamification/Leaderboard'));
const CoachPanel = React.lazy(() => import('./components/coach/CoachPanel'));
const Settings = React.lazy(() => import('./components/user/Settings'));
const ProgramOverview = React.lazy(() => import('./components/workout/ProgramOverview'));
const StatsPage = React.lazy(() => import('./components/stats/StatsPage'));
const OneRepMaxCalc = React.lazy(() => import('./components/stats/OneRepMaxCalc'));
const BadgesPage = React.lazy(() => import('./components/gamification/BadgesPage'));

// Fallback loader for Suspense
const PageLoader = () => (
  <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div className="skeleton-glow" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }}></div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <React.Suspense fallback={<PageLoader />}>
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
          </React.Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;
