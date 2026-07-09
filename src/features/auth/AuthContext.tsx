import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authService from '../../services/authService';
import type { Session } from '../../services/authService';

const SESSION_KEY = 'trove:session';

interface AuthContextValue {
  user: Session | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<Session>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(readStoredSession);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await authService.signIn(email, password);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
