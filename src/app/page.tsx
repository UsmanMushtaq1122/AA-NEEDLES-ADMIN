"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F5F0EB" }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#C9A96E" }}
        />
        <p
          className="text-sm font-medium tracking-wider uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A1A60" }}
        >
          Redirecting...
        </p>
      </div>
    </div>
  );
}
