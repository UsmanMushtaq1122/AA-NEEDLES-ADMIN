"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCredentials, setLoading } from "@/store/slices/authSlice";
import { api } from "@/lib/api";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

function getJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64url = token.split(".")[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = getJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= (payload.exp as number) * 1000;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function clearStoredAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
  deleteCookie("accessToken");
  deleteCookie("refreshToken");
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function normalizeRole(role: unknown): string {
  return typeof role === "string" ? role.toUpperCase() : "";
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, accessToken } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokenCookie = getCookie("accessToken");
        const storedUser = localStorage.getItem("user");

        if (tokenCookie && !isTokenExpired(tokenCookie)) {
          const response = await api.get<{
            success: boolean;
            data: {
              id: string;
              email: string;
              name: string;
              role: string;
              createdAt: string;
              emailVerified?: boolean;
            };
          }>("/auth/me", tokenCookie);
          const verifiedUser = response.data;
          const role = normalizeRole(verifiedUser?.role);

          if (response.success && verifiedUser && ADMIN_ROLES.has(role)) {
            const parsedUser = storedUser ? JSON.parse(storedUser) : {};
            const user = {
              ...parsedUser,
              ...verifiedUser,
              role,
              isActive: parsedUser?.isActive ?? true,
            };
            localStorage.setItem("user", JSON.stringify(user));
            dispatch(
              setCredentials({
                user,
                accessToken: tokenCookie,
                refreshToken: getCookie("refreshToken") || "",
              })
            );
            return;
          }
        }
      } catch {
        // Invalid, expired, revoked, or non-admin sessions are cleared below.
      }
      clearStoredAuth();
      dispatch(setLoading(false));
    };

    initAuth();
  }, [dispatch]);

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await api.post<{
      success: boolean;
      data: { user: any; token: string; refreshToken: string };
      message?: string;
    }>("/auth/login", { email, password });

    if (!response.success || !response.data) {
      throw new Error(response.message || "Login failed");
    }

    const { user: userData, token, refreshToken } = response.data;
    const role = normalizeRole(userData?.role);

    if (!ADMIN_ROLES.has(role)) {
      clearStoredAuth();
      throw new Error("This account does not have admin access.");
    }

    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify({ ...userData, role }));
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
    setCookie("accessToken", token, rememberMe ? 30 : 1);
    setCookie("refreshToken", refreshToken, rememberMe ? 30 : 1);

    dispatch(setCredentials({ user: { ...userData, role }, accessToken: token, refreshToken }));
    return { user: { ...userData, role }, accessToken: token, refreshToken };
  };

  const logout = async (queryClient?: { clear: () => void }) => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearStoredAuth();
    dispatch({ type: "auth/logout" });
    queryClient?.clear();
    router.push("/admin/login");
  };

  const ROLE_PERMISSIONS_MAP: Record<string, { resource: string; actions: string[] }[]> = {
    SUPER_ADMIN: [{ resource: "all", actions: ["create", "read", "update", "delete"] }],
    ADMIN: [{ resource: "all", actions: ["create", "read", "update", "delete"] }],
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS_MAP[normalizeRole(user.role)];
    if (!perms) return false;
    return perms.some((p) => (p.resource === "all" || p.resource === resource) && p.actions.includes(action));
  };

  return { user, isAuthenticated, isLoading, accessToken, login, logout, hasPermission };
}
