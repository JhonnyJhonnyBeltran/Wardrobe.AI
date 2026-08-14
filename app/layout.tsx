import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Klozet - Tu Asistente de Moda IA",
  description: "Genera outfits perfectos con inteligencia artificial. Tu estilista personal disponible 24/7.",
  manifest: "/manifest.json",
  icons: {
    icon: "/klozet-logo-dark.png",
    apple: "/klozet-logo-dark.png",
  },
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
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
