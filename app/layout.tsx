import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoTB",
  description: "Sistema de Visualização de Notificações de TB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        style={{ margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}
