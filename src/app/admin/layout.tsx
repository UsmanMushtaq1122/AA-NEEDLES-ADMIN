"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import Providers from "@/components/layout/providers";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminHeader from "@/components/layout/admin-header";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPublicRoute = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  useEffect(() => {
    if (!isPublicRoute && !isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router, isPublicRoute]);

  // Public routes (login, forgot-password, reset-password) render directly
  // without auth guard or sidebar/header shell
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F0EB]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent" />
          <span className="font-['Playfair_Display'] text-lg font-semibold text-[#1A1A1A]">
            AA Neddles
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "transition-transform duration-300"
        )}
      >
        <AdminSidebar />
      </div>

      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          "md:ml-[260px]",
          collapsed && "md:ml-[72px]"
        )}
      >
        <AdminHeader />
        <main className="flex-1 p-6">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Providers>
  );
}
