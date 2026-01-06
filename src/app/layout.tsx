import type { Metadata } from "next";
import "./globals.css";
import ToastHost from "@/components/ui/ToastHost";

export const metadata: Metadata = {
  title: "WF3 Comandas",
  description: "WF3 Comandas — Sistema de comandas para restaurantes",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
