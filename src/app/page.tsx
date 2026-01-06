"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function HomePage() {
  const router = useRouter();
  const { hydrate, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role === "MANAGER") router.replace("/admin/dashboard");
    else router.replace("/operational/overview");
  }, [isAuthenticated, user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-zinc-500">Carregando…</div>
    </main>
  );
}
