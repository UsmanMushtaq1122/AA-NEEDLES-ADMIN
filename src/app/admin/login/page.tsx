"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { loginSchema } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function LoginForm({ redirect = "/admin" }: { redirect?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, isLoading: authLoading, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect already-authenticated users to the dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirect);
    }
  }, [authLoading, isAuthenticated, router, redirect]);

  // Show loading spinner while auth state is being determined
  if (authLoading) {
    return (
      <Card className="border-0 shadow-2xl shadow-black/10">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#C9A96E", borderTopColor: "transparent" }} />
          <p className="mt-4 text-sm" style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A1A80" }}>
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Don't render the form if already authenticated (redirect is in progress)
  if (isAuthenticated) {
    return (
      <Card className="border-0 shadow-2xl shadow-black/10">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#C9A96E", borderTopColor: "transparent" }} />
          <p className="mt-4 text-sm" style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A1A80" }}>
            Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: any) => {
    setError(null);
    setIsLocked(false);
    setIsSubmitting(true);

    try {
      await login(data.email, data.password, data.rememberMe);
      router.replace(redirect);
    } catch (err: any) {
      const message = err?.message || "An unexpected error occurred";

      if (message.includes("rate limit") || message.includes("too many")) {
        setError("Too many login attempts. Please wait a moment and try again.");
        setIsLocked(true);
      } else if (message.includes("locked") || message.includes("account locked")) {
        setError("Your account has been locked due to multiple failed attempts. Please contact support.");
        setIsLocked(true);
      } else if (message.includes("Invalid") || message.includes("invalid") || message.includes("credentials")) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (message.includes("not found") || message.includes("does not exist")) {
        setError("No account found with this email address.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl shadow-black/10">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1
            className="text-4xl font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", color: "#1A1A1A" }}
          >
            AA Neddles
          </h1>
          <div className="w-12 h-0.5 mx-auto my-3" style={{ backgroundColor: "#C9A96E" }} />
          <p
            className="text-sm font-medium tracking-widest uppercase"
            style={{ fontFamily: "'Inter', sans-serif", color: "#C9A96E" }}
          >
            Admin Dashboard
          </p>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-6 pb-8 px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 rounded-lg mb-6"
            style={{
              backgroundColor: "#8B1A1A10",
              border: "1px solid #8B1A1A25",
            }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#8B1A1A" }} />
            <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: "#8B1A1A" }}>
              {error}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A1A" }}
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@aanneddles.com"
              disabled={isSubmitting || isLocked}
              className="h-12 px-4 text-sm rounded-lg border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-0"
              style={{
                fontFamily: "'Inter', sans-serif",
                borderColor: errors.email ? "#8B1A1A" : "#E5E0DB",
                backgroundColor: "#FAFAF8",
              }}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif", color: "#8B1A1A" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A1A" }}
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={isSubmitting || isLocked}
                className="h-12 px-4 pr-12 text-sm rounded-lg border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-0"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  borderColor: errors.password ? "#8B1A1A" : "#E5E0DB",
                  backgroundColor: "#FAFAF8",
                }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || isLocked}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-200"
                style={{ color: "#1A1A1A80" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif", color: "#8B1A1A" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isSubmitting || isLocked}
                className="w-4 h-4 rounded border-gray-300 accent-current cursor-pointer"
                style={{ accentColor: "#C9A96E" }}
                {...register("rememberMe")}
              />
              <span
                className="text-sm"
                style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A1A" }}
              >
                Remember Me
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="w-full h-12 text-sm font-semibold uppercase tracking-widest rounded-lg transition-all duration-300 hover:shadow-lg"
            style={{
              fontFamily: "'Inter', sans-serif",
              backgroundColor: "#C9A96E",
              color: "#FFFFFF",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/forgot-password"
            className="text-sm font-medium transition-colors duration-200 hover:underline"
            style={{ fontFamily: "'Inter', sans-serif", color: "#C9A96E" }}
          >
            Forgot Password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginFormWrapper() {
  const [redirect, setRedirect] = useState("/admin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get("redirect") || "/admin");
  }, []);

  return <LoginForm redirect={redirect} />;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="w-full max-w-md">
        <LoginFormWrapper />
      </div>
    </div>
  );
}
