"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(72)
});

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next");

  const { login } = useAuthStore();

  const [email, setEmail] = useState("gestor@restaurante1.com");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);

  const error = useMemo(() => {
    const parsed = schema.safeParse({ email, password });
    if (parsed.success) return null;
    return parsed.error.issues[0]?.message ?? "Dados inválidos";
  }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Validação", parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setLoading(true);
    try {
      const user = await login(parsed.data.email, parsed.data.password);

      // Redirect por role
      if (nextPath) {
        router.replace(nextPath);
      } else if (user.role === "MANAGER") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/operational/overview");
      }
    } catch (err: any) {
      toast.error("Login", err?.message ?? "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl overflow-hidden shadow-soft bg-white flex items-center justify-center">
            <Image src="/logo.png" alt="WF3 Comandas" width={48} height={48} />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">WF3 Comandas</h1>
            <p className="text-sm text-zinc-500">Acesse com seu e-mail e senha</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-zinc-100 p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gestor@restaurante1.com"
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error ? (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </div>
            ) : null}

            <Button type="submit" full disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>

            <p className="text-xs text-zinc-500">
              Dica: use os logins do seed do back-end (restaurante1 / restaurante2).
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
