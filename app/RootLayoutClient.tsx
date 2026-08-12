'use client';

/**
 * RootLayoutClient - Client-side providers and dynamic imports
 * Separated from root layout.tsx to allow ssr: false with dynamic imports
 */

import dynamic from "next/dynamic";
import { UserProvider, ThemeProvider } from "@/store";
import RealtimeProvider from "@/components/RealtimeProvider";
import MessageProvider from "@/components/MessageProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import SmartModelPreloader from "@/components/SmartModelPreloader";

import { Toaster } from 'sonner';

// Dynamic imports for non-critical components - loaded only when needed
const SystemModal = dynamic(() => import("@/components/SystemModal"), {
  loading: () => null,
});

const SocialListener = dynamic(() => import("@/components/SocialListener"), {
  loading: () => null,
});

const AppLifecycleManager = dynamic(() => import("@/components/AppLifecycleManager"), {
  loading: () => null,
});

const NotificationToastContainer = dynamic(
  () => import("@/components/NotificationToast").then(mod => ({ default: mod.NotificationToastContainer })),
  {
    loading: () => null,
  }
);

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
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
              <Toaster position="top-center" richColors theme="system" expand={true} />
              <SystemModal />
            </MessageProvider>
          </RealtimeProvider>
        </UserProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
