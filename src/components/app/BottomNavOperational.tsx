"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, Printer, User } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/operational/overview", label: "Mesas", icon: Home },
  { href: "/operational/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/operational/print", label: "Cozinha", icon: Printer },
  { href: "/operational/profile", label: "Perfil", icon: User }
];

export default function BottomNavOperational() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "py-2.5 flex flex-col items-center justify-center gap-1 text-xs",
                active ? "text-zinc-900" : "text-zinc-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "" : "opacity-80")} />
              <span className={cn(active ? "font-medium" : "")}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
