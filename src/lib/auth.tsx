import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const AUTH_STORAGE_KEY = "stockwise.frontend.auth";

export interface FrontendUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

interface FrontendSession {
  user: FrontendUser;
}

interface AuthCtx {
  session: FrontendSession | null;
  user: FrontendUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

function createSession(email: string, fullName?: string): FrontendSession {
  return {
    user: {
      id: email.trim().toLowerCase(),
      email: email.trim(),
      user_metadata: {
        full_name: fullName?.trim() || "user",
      },
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored) as FrontendSession);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email: string, password: string) => {
        if (!email.trim() || !password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }
        const nextSession = createSession(email);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      signUp: async (email: string, password: string, fullName: string) => {
        if (!email.trim() || !password || !fullName.trim()) {
          throw new Error("กรุณากรอกข้อมูลให้ครบ");
        }
        const nextSession = createSession(email, fullName);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      signOut: async () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setSession(null);
      },
    }),
    [session, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
