const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const newToken = this.getAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
          if (!retryResponse.ok) {
            throw new ApiError("Unauthorized", retryResponse.status);
          }
          return retryResponse.json();
        }
      }
      if (typeof window !== "undefined") {
        this.clearAuth();
        window.location.href = "/admin/login";
      }
      throw new ApiError("Unauthorized", 401);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }));
      throw new ApiError(error.message || "An error occurred", response.status);
    }

    return response.json();
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
  }

  private clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    document.cookie = "accessToken=; path=/; max-age=0";
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", token });
  }

  async post<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  }

  async put<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", token });
  }

  async upload<T>(endpoint: string, formData: FormData, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new ApiError(error.message || "Upload failed", response.status);
    }

    return response.json();
  }

  setAuthTokens(accessToken: string, refreshToken: string) {
    this.setTokens(accessToken, refreshToken);
  }

  getStoredUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  setStoredUser(user: unknown) {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  }

  logout() {
    this.clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const api = new ApiClient(API_BASE_URL);
