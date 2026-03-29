"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_KEYS } from "@/lib/constants";
import { migrateLocalStorageToDB } from "@/lib/migration-helper";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isPaid: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  testLogin: () => void;
}

const TEST_USER_KEY = "barda_test_user";

function makeTestUser(): User {
  return {
    id: "test-user-00000000-0000-0000-0000-000000000000",
    email: "test@barda.dev",
    app_metadata: {},
    user_metadata: { full_name: "테스트 유저" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isPaid: false,
  isLoading: true,
  signOut: async () => {},
  testLogin: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const isTestUser = typeof window !== "undefined" && localStorage.getItem(TEST_USER_KEY) === "true";
  const [user, setUser] = useState<User | null>(() => isTestUser ? makeTestUser() : null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPaid, setIsPaid] = useState(() => isTestUser);
  const [isLoading, setIsLoading] = useState(() => !isTestUser);

  const checkPaidStatus = useCallback(async (userId: string) => {
    // Dev override
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.DEV_UNLOCK) === "true") {
      setIsPaid(true);
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "success")
      .limit(1);

    setIsPaid((data?.length ?? 0) > 0);
  }, []);

  useEffect(() => {
    // Skip Supabase init if test user is active
    if (typeof window !== "undefined" && localStorage.getItem(TEST_USER_KEY) === "true") {
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPaidStatus(session.user.id);
        migrateLocalStorageToDB(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPaidStatus(session.user.id);
      } else {
        setIsPaid(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkPaidStatus]);

  const testLogin = () => {
    localStorage.setItem(TEST_USER_KEY, "true");
    localStorage.setItem(STORAGE_KEYS.DEV_UNLOCK, "true");
    setUser(makeTestUser());
    setIsPaid(true);
    setIsLoading(false);
  };

  const signOut = async () => {
    // Clear test user
    if (typeof window !== "undefined" && localStorage.getItem(TEST_USER_KEY) === "true") {
      localStorage.removeItem(TEST_USER_KEY);
      localStorage.removeItem(STORAGE_KEYS.DEV_UNLOCK);
      setUser(null);
      setSession(null);
      setIsPaid(false);
      return;
    }
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isPaid, isLoading, signOut, testLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
