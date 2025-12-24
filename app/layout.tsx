import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider, ThemeProvider } from "@/store";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Klozet - Tu Asistente de Moda IA",
  description: "Genera outfits perfectos con inteligencia artificial. Tu estilista personal disponible 24/7.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Klozet",
  },
  keywords: ["moda", "IA", "outfits", "estilista", "armario virtual", "fashion", "klozet"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF69B4",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <UserProvider>
            <AppLayout>{children}</AppLayout>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
