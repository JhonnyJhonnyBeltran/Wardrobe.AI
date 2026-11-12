'use client';

/**
 * RootLayoutClient - Client-side providers and dynamic imports
 * Separated from root layout.tsx to allow ssr: false with dynamic imports
 */

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { UserProvider, ThemeProvider, useTheme } from "@/store";
import RealtimeProvider from "@/components/RealtimeProvider";
import RevenueCatProvider from "@/components/RevenueCatProvider";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import SmartModelPreloader from "@/components/SmartModelPreloader";
import LanguageDomTranslator from "@/components/LanguageDomTranslator";

import { Toaster } from 'sonner';

// Dynamic imports for client-only overlays and telemetry - zero SSR hydration mismatch
const SystemModal = dynamic(() => import("@/components/SystemModal"), {
  ssr: false,
  loading: () => null,
});

const SocialListener = dynamic(() => import("@/components/SocialListener"), {
  ssr: false,
  loading: () => null,
});

const AppLifecycleManager = dynamic(() => import("@/components/AppLifecycleManager"), {
  ssr: false,
  loading: () => null,
});

const NotificationToastContainer = dynamic(
  () => import("@/components/NotificationToast").then(mod => ({ default: mod.NotificationToastContainer })),
  {
    ssr: false,
    loading: () => null,
  }
);

const CookiesBanner = dynamic(() => import("@/components/CookiesBanner"), {
  ssr: false,
  loading: () => null,
});

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then(mod => ({ default: mod.Analytics })),
  { ssr: false, loading: () => null }
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then(mod => ({ default: mod.SpeedInsights })),
  { ssr: false, loading: () => null }
);

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster 
      position="top-center" 
      theme={isDark ? 'dark' : 'light'} 
      expand={true} 
      toastOptions={{
        style: {
          background: 'var(--brand-pink)',
          color: 'white',
          border: 'none',
        },
        className: 'font-sans font-medium shadow-xl rounded-2xl',
      }}
    />
  );
}

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  useEffect(() => {
    // Intercept and silence third-party browser extension / performance observer errors (e.g. reportAllChanges / startTime)
    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      if (
        msg.includes("Cannot read properties of undefined (reading 'startTime')") ||
        msg.includes('reportAllChanges') ||
        msg.includes('ResizeObserver loop')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);

    // Block pinch-to-zoom gestures across mobile web browsers (especially iOS Safari)
    const preventPinchZoom = (event: Event) => {
      event.preventDefault();
    };
    const preventMultiTouchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener('gesturestart', preventPinchZoom, { passive: false });
    document.addEventListener('gesturechange', preventPinchZoom, { passive: false });
    document.addEventListener('gestureend', preventPinchZoom, { passive: false });
    document.addEventListener('touchmove', preventMultiTouchZoom, { passive: false });

    return () => {
      window.removeEventListener('error', handleError);
      document.removeEventListener('gesturestart', preventPinchZoom);
      document.removeEventListener('gesturechange', preventPinchZoom);
      document.removeEventListener('gestureend', preventPinchZoom);
      document.removeEventListener('touchmove', preventMultiTouchZoom);
    };
  }, []);
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <RevenueCatProvider>
            <RealtimeProvider>
              {/* Critical components */}
              <LanguageDomTranslator />
              <SmartModelPreloader />
              <AppLifecycleManager />
              
              {/* Non-critical components - loaded dynamically */}
              <SocialListener />
              
              {/* Main content directly (layouts handled by Route Groups) */}
              {children}
              
              {/* UI overlays & telemetry - loaded client-side */}
              <NotificationToastContainer position="top-right" />
              <CookiesBanner />
              <ThemedToaster />
              <SystemModal />
              <Analytics />
              <SpeedInsights />
            </RealtimeProvider>
          </RevenueCatProvider>
        </UserProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
