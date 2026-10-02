import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barco José | Operação embarcada",
  description: "MVP de validação para encomendas, estoque e suítes.",
  applicationName: "Barco José",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Barco José",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1728",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
