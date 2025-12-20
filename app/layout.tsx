import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/store";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Wardrobe.AI - Tu Asistente de Moda IA",
  description: "Genera outfits perfectos con inteligencia artificial. Tu estilista personal disponible 24/7.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wardrobe.AI",
  },
  keywords: ["moda", "IA", "outfits", "estilista", "armario virtual", "fashion"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ec4899",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <UserProvider>
          <AppLayout>{children}</AppLayout>
        </UserProvider>
      </body>
    </html>
  );
}
