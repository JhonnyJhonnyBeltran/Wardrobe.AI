import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies y almacenamiento local en Klozet según la normativa europea AEPD y LSSI-CE.',
  alternates: {
    canonical: '/cookies',
  },
  openGraph: {
    title: 'Política de Cookies | Klozet',
    description: 'Guía transparente sobre cookies técnicas y analíticas utilizadas en Klozet.',
    url: 'https://klozet.es/cookies',
    type: 'website',
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
