"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isPaid: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isPaid: false,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPaidStatus(session.user.id);
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
  }, []);

  async function checkPaidStatus(userId: string) {
    // Dev override
    if (typeof window !== "undefined" && localStorage.getItem("barda_dev_unlock") === "true") {
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
  }

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isPaid, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
