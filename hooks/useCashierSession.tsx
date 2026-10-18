"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const SESSION_STORAGE_KEY = "ellescyu-cashier-session";

export type CashierSession = {
  cashierId: string;
  username: string;
  displayName: string;
  shiftId: string;
};

type CashierSessionContextValue = {
  session: CashierSession | null;
  setSession: (session: CashierSession | null) => void;
  hydrated: boolean;
};

const CashierSessionContext = createContext<CashierSessionContextValue | null>(null);

export function CashierSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<CashierSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) setSessionState(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  const setSession = (next: CashierSession | null) => {
    setSessionState(next);
    try {
      if (next) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore storage failures
    }
  };

  return (
    <CashierSessionContext.Provider value={{ session, setSession, hydrated }}>
      {children}
    </CashierSessionContext.Provider>
  );
}

export function useCashierSession() {
  const ctx = useContext(CashierSessionContext);
  if (!ctx) throw new Error("useCashierSession must be used within a CashierSessionProvider");
  return ctx;
}