"use client";

import Image from "next/image";
import { LogOut, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuthStore } from "@/store/auth";
import { useOperationalStore } from "@/store/operational";
import { toast } from "@/store/ui";

type AppHeaderProps = Readonly<{
  variant: "operational" | "admin";
}>;

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return null;
}

export default function AppHeader({ variant }: AppHeaderProps) {
  const { user, logout, refreshMe } = useAuthStore();
  const { operationalWaiterName, clearOperationalWaiter } = useOperationalStore();

  async function onLogout() {
    await logout();
    clearOperationalWaiter();
    toast.info("Sessão", "Você saiu da conta.");
  }

  async function onRefresh() {
    try {
      await refreshMe();
      toast.success("Conta", "Dados atualizados.");
    } catch (e: unknown) {
      toast.error("Conta", getErrorMessage(e) ?? "Falha ao atualizar");
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-100">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl overflow-hidden bg-white shadow-soft flex items-center justify-center">
          <Image src="/logo.png" alt="WF3 Comandas" width={40} height={40} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold truncate">WF3 Comandas</h1>
            {variant === "admin" ? <Badge>Admin</Badge> : <Badge>Operacional</Badge>}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {user ? (
              <>
                {user.email} • {user.role}
                {variant === "operational" && operationalWaiterName ? ` • Garçom: ${operationalWaiterName}` : ""}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onRefresh} title="Atualizar" ariaLabel="Atualizar">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={onLogout} title="Sair" ariaLabel="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
