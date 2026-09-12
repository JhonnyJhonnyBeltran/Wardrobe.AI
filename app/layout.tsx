import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://klozet.es";
const SITE_TITLE = "Klozet — La Red Social de Moda, Inspo Outfits & Armario Virtual con IA";
const SITE_DESCRIPTION = "Únete a Klozet, la red social de moda donde compartir tus outfits diarios, descubrir inspiración estilo Pinterest, digitalizar tu ropa y crear looks con estilismo IA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Klozet | Red Social de Moda, Outfits & Inspo",
    template: "%s | Klozet"
  },
  description: SITE_DESCRIPTION,
  applicationName: "Klozet",
  authors: [{ name: "Klozet Team", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "red social de moda",
    "red social de outfits",
    "red social de ropa",
    "comunidad de moda",
    "compartir outfits",
    "inspo outfits",
    "pinterest de moda",
    "pinterest de outfits",
    "ootd espana",
    "outfit of the day app",
    "Klozet",
    "klozet app",
    "klozet red social",
    "streetwear espana",
    "lookbook digital",
    "tendencias de moda",
    "armario virtual",
    "armario digital",
    "combinar ropa con IA",
    "estilista personal IA",
    "Kloe IA",
    "fashion social network",
    "fashion community",
    "digital closet"
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
    siteName: "Klozet — Red Social de Moda",
    images: [
      {
        url: "/klozet-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Klozet - La Red Social de Moda, Inspo Outfits y Armario Virtual con IA"
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
        "name": "Klozet — Red Social de Moda",
        "alternateName": ["Klozet", "Klozet App", "Klozet Fashion Community", "Klozet Red Social", "Klozet AI"],
        "url": SITE_URL,
        "applicationCategory": "SocialNetworkingApplication",
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
          "Red social para compartir outfits y descubrir inspiración de moda",
          "Feed y buscador estilo Pinterest con filtros por estilo y género",
          "Armario virtual inteligente con eliminación automática de fondos",
          "Generador interactivo de looks con asesoría IA Kloe 24/7",
          "Perfiles de moda, seguidores y guardado de looks en carpetas",
          "Interacción social con likes, comentarios y etiquetas de prendas"
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
        "name": "Klozet — Red Social de Moda",
        "description": "La comunidad y red social de moda para compartir outfits, inspirarse y organizar tu armario con inteligencia artificial.",
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4628313000953034"
          crossOrigin="anonymous"
        />
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
