const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
const defaultApiBase = process.env.NODE_ENV === "production"
  ? "https://api.aaneedles.com/api/v1"
  : "http://localhost:5000/api/v1";
const API_BASE_URL = (configuredApiBase || defaultApiBase).replace(/\/+$/, "");

let parsedApiBase: URL;
try {
  parsedApiBase = new URL(API_BASE_URL);
} catch {
  throw new Error("NEXT_PUBLIC_API_URL must be an absolute URL ending in /api/v1.");
}

if (
  !["http:", "https:"].includes(parsedApiBase.protocol)
  || !parsedApiBase.pathname.endsWith("/api/v1")
  || parsedApiBase.username
  || parsedApiBase.password
) {
  throw new Error("NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL ending in /api/v1.");
}

if (process.env.NODE_ENV === "production" && parsedApiBase.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_API_URL must use HTTPS in production.");
}

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token: explicitToken, ...fetchOptions } = options;
    const storedToken = this.getAccessToken();
    const token = explicitToken || storedToken;

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

    if (response.status === 304) {
      return {} as T;
    }

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
          if (retryResponse.status === 304) {
            return {} as T;
          }
          if (!retryResponse.ok) {
            throw new ApiError("Unauthorized", retryResponse.status);
          }
          return retryResponse.json();
        }
      }
      if (typeof window !== "undefined") {
        this.clearAuth();
        if (window.location.pathname !== "/admin/login") {
          window.location.replace("/admin/login");
        }
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
    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict${secure}; max-age=${7 * 24 * 60 * 60}`;
  }

  private clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    document.cookie = `accessToken=; path=/; max-age=0`;
  }

  private async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._refreshToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async _refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data) {
        this.setTokens(data.data.token, data.data.refreshToken);
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

  async upload<T>(
    endpoint: string,
    formData: FormData,
    method: string = "POST",
    token?: string,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    const headers: Record<string, string> = { ...(extraHeaders || {}) };
    const storedToken = this.getAccessToken();
    const authToken = token || storedToken;
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: formData,
    });

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const newToken = this.getAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: formData,
          });
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ message: "Upload failed" }));
            throw new ApiError(error.message || "Upload failed", retryResponse.status);
          }
          return retryResponse.json();
        }
      }
      if (typeof window !== "undefined") {
        this.clearAuth();
        if (window.location.pathname !== "/admin/login") {
          window.location.replace("/admin/login");
        }
      }
      throw new ApiError("Unauthorized", 401);
    }

    if (!response.ok) {
      if (response.status === 413) {
        throw new ApiError(
          "The image is too large for the production upload gateway. Choose a smaller image.",
          response.status
        );
      }
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
