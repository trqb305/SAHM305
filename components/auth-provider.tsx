"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AuthUser = {
  email: string;
  name: string;
  initials: string;
  isAdmin: boolean;
  role: "admin" | "moderator" | "user";
  tier: "radar" | "signal" | "edge" | "alpha";
};

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  // For admin role-switcher (preview as user)
  viewAs: "admin" | "user";
  setViewAs: (v: "admin" | "user") => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "sahm305-auth";
const VIEW_KEY = "sahm305-viewAs";

// Demo credentials — in production, this is replaced with Supabase Auth
const ADMIN_EMAIL = "nif305@gmail.com";
const ADMIN_PASSWORD = "Zx.321321";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [viewAs, setViewAsState] = useState<"admin" | "user">("admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "admin" || v === "user") setViewAsState(v);
    } catch {}
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const e = email.trim().toLowerCase();

    if (e === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const u: AuthUser = {
        email: ADMIN_EMAIL,
        name: "مدير النظام",
        initials: "م.ن",
        isAdmin: true,
        role: "admin",
        tier: "alpha",
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setViewAsState("admin");
      localStorage.setItem(VIEW_KEY, "admin");
      return { ok: true as const };
    }

    if (e && password.length >= 4) {
      const u: AuthUser = {
        email: e,
        name: e.split("@")[0],
        initials: e.slice(0, 2).toUpperCase(),
        isAdmin: false,
        role: "user",
        tier: "signal",
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setViewAsState("user");
      localStorage.setItem(VIEW_KEY, "user");
      return { ok: true as const };
    }

    return { ok: false as const, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEW_KEY);
  };

  const setViewAs = (v: "admin" | "user") => {
    setViewAsState(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, viewAs, setViewAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
