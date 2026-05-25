"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "same-origin",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = (await response.json()) as { user: AuthUser };
      setUser(payload.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setUser(null);
    }
  }, []);

  return {
    user,
    loading,
    logout,
    refreshUser,
  };
}
