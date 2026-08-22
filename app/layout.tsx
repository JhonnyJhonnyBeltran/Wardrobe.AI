import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://klozet.ai";
const SITE_TITLE = "Closet & Klozet | Genera Outfits con Inteligencia Artificial & Red Social de Moda";
const SITE_DESCRIPTION = "Klozet es la red social de moda y armario virtual inteligente número 1. Digitaliza tu ropa, genera outfits perfectos con inteligencia artificial, comparte tu estilo con la comunidad y recibe estilismo 24/7 con tu asesora IA Kloe.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Klozet - Armario Virtual & Red Social de Moda"
  },
  description: SITE_DESCRIPTION,
  applicationName: "Klozet",
  authors: [{ name: "Klozet Team", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "Closet",
    "Klozet",
    "genera outfits perfectos con inteligencia artificial",
    "red social de moda",
    "armario virtual",
    "estilista personal inteligencia artificial",
    "outfits con mi ropa",
    "combinar ropa con IA",
    "fashion app",
    "crear looks",
    "Kloe IA",
    "outfit generator AI",
    "digital wardrobe",
    "moda y tendencias",
    "comunidad de moda",
    "streetwear",
    "outfit inspo"
  ],
  referrer: "origin-when-cross-origin",
  creator: "Klozet",
  publisher: "Klozet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Klozet",
    images: [
      {
        url: "/klozet-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Klozet - Red Social de Moda y Generador de Outfits con Inteligencia Artificial"
      }
    ],
    locale: "es_ES",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/klozet-logo-dark.png"],
    creator: "@klozet_ai"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/klozet-logo-dark.png" },
      { url: "/klozet-logo-dark.png", type: "image/png" }
    ],
    shortcut: ["/klozet-logo-dark.png"],
    apple: [
      { url: "/klozet-logo-dark.png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Klozet"
  },
  category: "fashion"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rich JSON-LD Structured Data Schema for Google Knowledge Graph & Top Rankings
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        "name": "Klozet",
        "alternateName": ["Closet AI", "Klozet Moda", "Wardrobe AI"],
        "url": SITE_URL,
        "applicationCategory": "LifestyleApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description": SITE_DESCRIPTION,
        "image": `${SITE_URL}/klozet-logo-dark.png`,
        "screenshot": `${SITE_URL}/klozet-logo-dark.png`,
        "inLanguage": "es-ES",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR",
          "category": "FreeTier"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1250",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "Generador de outfits inteligentes con IA",
          "Red social para compartir y descubrir looks",
          "Armario virtual con eliminación automática de fondos",
          "Asistente y estilista de moda Kloe disponible 24/7",
          "Calendario inteligente de outfits",
          "Lienzo interactivo para diseñar y personalizar looks"
        ]
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Klozet",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/klozet-logo-dark.png`,
          "caption": "Klozet Logo"
        },
        "sameAs": [
          "https://instagram.com/klozet.ai",
          "https://tiktok.com/@klozet.ai"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "Klozet",
        "description": "La red social de moda y armario virtual con inteligencia artificial",
        "publisher": {
          "@id": `${SITE_URL}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
