import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Klozet de acuerdo con el RGPD y normativas de protección de datos personales y seguridad.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Política de Privacidad | Klozet',
    description: 'Conoce cómo protegemos tus datos, imágenes y privacidad en Klozet.',
    url: 'https://klozet.es/privacy',
    type: 'website',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
