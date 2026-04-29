import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { UserProvider, ThemeProvider } from "@/store";
import ConditionalLayout from "@/components/ConditionalLayout";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import RealtimeProvider from "@/components/RealtimeProvider";
import MessageProvider from "@/components/MessageProvider";
import SmartModelPreloader from "@/components/SmartModelPreloader";

// Dynamic imports for non-critical components - loaded only when needed
const SystemModal = dynamic(() => import("@/components/SystemModal"), {
  loading: () => null, // Don't show anything while loading
  ssr: false, // Disable SSR for client-only component
});

const SocialListener = dynamic(() => import("@/components/SocialListener"), {
  loading: () => null,
  ssr: false,
});

const AppLifecycleManager = dynamic(() => import("@/components/AppLifecycleManager"), {
  loading: () => null,
  ssr: false,
});

const NotificationToastContainer = dynamic(
  () => import("@/components/NotificationToast").then(mod => ({ default: mod.NotificationToastContainer })),
  {
    loading: () => null,
    ssr: false,
  }
);

// Deprecated: WardrobePreloader is no longer used - models are preloaded on-demand
// Deprecated: BackgroundInitializer is simplified - reserved for future tasks

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
                  {/* Critical components */}
                  <SmartModelPreloader />
                  <AppLifecycleManager />
                  
                  {/* Non-critical components - loaded dynamically */}
                  <SocialListener />
                  
                  {/* Main layout */}
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                  
                  {/* UI overlays - loaded on-demand */}
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
