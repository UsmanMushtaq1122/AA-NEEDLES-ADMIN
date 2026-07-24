"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCredentials, setLoading } from "@/store/slices/authSlice";
import { User } from "@/types";

// ─── Mock Admin Credentials ────────────────────────────────────────────────
// WARNING: These are MOCK credentials for development ONLY.
// Remove this entire block and replace with real backend authentication
// before deploying to production. Never hardcode credentials in source.
const MOCK_CREDENTIALS = [
  { email: "admin@neddles.com",    password: "password123", role: "super_admin" as const },
  { email: "admin@aanneddles.com", password: "admin123",    role: "super_admin" as const },
];

const MOCK_TOKEN = "mock-access-token-aa-neddles-2026";

// Helpers: cookie r/w so the middleware (server-side) can see the token
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict${secure}`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}
// ───────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, accessToken } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  // On mount: restore session from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser  = localStorage.getItem("user");

        if (storedToken && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          dispatch(
            setCredentials({
              user: parsedUser,
              accessToken: storedToken,
              refreshToken: localStorage.getItem("refreshToken") || "",
            })
          );
          return;
        }
      } catch {
        // corrupt data — clear everything
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        deleteCookie("accessToken");
      }
      dispatch(setLoading(false));
    };

    initAuth();
  }, [dispatch]);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    // Simulate a short network delay
    await new Promise((r) => setTimeout(r, 500));

    const match = MOCK_CREDENTIALS.find(
      (c) =>
        c.email.toLowerCase() === email.toLowerCase() &&
        c.password === password
    );

    if (!match) {
      throw new Error(
        "Invalid email or password. Please check your credentials and try again."
      );
    }

    const mockUser: User = {
      id: "admin-001",
      name: "Admin",
      email: match.email,
      role: match.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const token        = MOCK_TOKEN;
    const refreshToken = "mock-refresh-token";

    // Persist in localStorage (client reads) AND cookie (middleware reads)
    localStorage.setItem("accessToken",  token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user",         JSON.stringify(mockUser));
    setCookie("accessToken", token, 7);

    dispatch(setCredentials({ user: mockUser, accessToken: token, refreshToken }));
    return { user: mockUser, accessToken: token, refreshToken };
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = (queryClient?: { clear: () => void }) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    deleteCookie("accessToken");
    dispatch({ type: "auth/logout" });
    queryClient?.clear();
    router.push("/admin/login");
  };

  // ── Permission check ───────────────────────────────────────────────────
  const hasPermission = (_resource: string, _action: string): boolean => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    return false;
  };

  return { user, isAuthenticated, isLoading, accessToken, login, logout, hasPermission };
}
