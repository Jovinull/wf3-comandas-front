"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

type ProtectedProps = Readonly<{
  allow: readonly UserRole[];
  children: ReactNode;
}>;

export default function Protected({ allow, children }: ProtectedProps) {
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
    if (!user || !allow.includes(user.role)) {
      router.replace(user?.role === "MANAGER" ? "/admin/dashboard" : "/operational/overview");
    }
  }, [isAuthenticated, user, allow, router]);

  if (!isAuthenticated || !user || !allow.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
        Carregando…
      </div>
    );
  }

  return <>{children}</>;
}
