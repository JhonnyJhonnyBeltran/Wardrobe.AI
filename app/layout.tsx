import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider, ThemeProvider } from "@/store";
import ConditionalLayout from "@/components/ConditionalLayout";
import SystemModal from "@/components/SystemModal";
import SocialListener from "@/components/SocialListener";
import RealtimeProvider from "@/components/RealtimeProvider";
import MessageProvider from "@/components/MessageProvider";
import { NotificationToastContainer } from "@/components/NotificationToast";
import WardrobePreloader from "@/components/WardrobePreloader";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import AppLifecycleManager from "@/components/AppLifecycleManager";

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
      <body className="antialiased">
        <GlobalErrorBoundary>
            <ThemeProvider>
              <UserProvider>
                <RealtimeProvider>
                  <MessageProvider>
                    <AppLifecycleManager />
                    <SocialListener />
                    <WardrobePreloader />
                    <ConditionalLayout>
                      {children}
                    </ConditionalLayout>
                    <NotificationToastContainer position="top-right" />
                    <SystemModal />
                  </MessageProvider>
                </RealtimeProvider>
              </UserProvider>
            </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
