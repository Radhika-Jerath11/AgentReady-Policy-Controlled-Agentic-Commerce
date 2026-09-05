"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SessionUser, DEFAULT_SESSION_USER } from "@/components/UserLoginModal";

interface SessionContextValue {
  currentUser: SessionUser;
  setCurrentUser: (user: SessionUser) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SessionUser>(DEFAULT_SESSION_USER);

  return (
    <SessionContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
