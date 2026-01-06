"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { useOperationalStore } from "@/store/operational";
import { toast } from "@/store/ui";

export default function OperationalProfilePage() {
  const { user, logout } = useAuthStore();
  const { operationalWaiterId, operationalWaiterName, clearOperationalWaiter } = useOperationalStore();

  async function onLogout() {
    await logout();
    clearOperationalWaiter();
    toast.info("Sessão", "Você saiu.");
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Perfil</h2>

      <Card className="p-4">
        <div className="text-sm font-semibold">Conta</div>
        <div className="mt-2 text-sm text-zinc-700">
          <div><span className="text-zinc-500">E-mail:</span> {user?.email ?? "—"}</div>
          <div><span className="text-zinc-500">Role:</span> {user?.role ?? "—"}</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Garçom operacional (seleção)</div>
        <div className="mt-2 text-sm text-zinc-700">
          <div><span className="text-zinc-500">ID:</span> {operationalWaiterId ?? "—"}</div>
          <div><span className="text-zinc-500">Nome:</span> {operationalWaiterName ?? "—"}</div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" onClick={clearOperationalWaiter}>
            Limpar seleção
          </Button>
        </div>
      </Card>

      <Button variant="danger" full onClick={onLogout}>
        Sair
      </Button>
    </div>
  );
}
