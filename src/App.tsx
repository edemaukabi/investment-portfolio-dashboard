import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import PageLoader from './components/PageLoader';
import { InfoDialogProvider } from './components/InfoDialog';

// Lazy so the login screen doesn't ship the dashboard bundle (Recharts is
// by far the largest dependency and only the dashboard needs it).
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <InfoDialogProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </InfoDialogProvider>
  );
}
