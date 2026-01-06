"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, Tags, Utensils, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/waiters", label: "Garçons", icon: Users },
  { href: "/admin/tables", label: "Mesas", icon: List },
  { href: "/admin/categories", label: "Categorias", icon: Tags },
  { href: "/admin/products", label: "Produtos", icon: Utensils }
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {items.map((it) => {
        const active = pathname === it.href;
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm",
              active
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-200"
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
