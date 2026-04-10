"use client";

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store';

/**
 * AuthProvider fetches the current user session on mount
 * and stores it in the global auth store.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
