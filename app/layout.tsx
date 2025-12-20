import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/store";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Wardrobe.AI - Your Personal Fashion Assistant",
  description: "AI-powered outfit generator and wardrobe manager",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wardrobe.AI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <AppLayout>{children}</AppLayout>
        </UserProvider>
      </body>
    </html>
  );
}
