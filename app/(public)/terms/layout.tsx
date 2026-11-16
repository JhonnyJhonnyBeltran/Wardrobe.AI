import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso',
  description: 'Términos y condiciones de uso de Klozet. Conoce las normas de la comunidad, derechos de propiedad y condiciones del servicio.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Términos y Condiciones | Klozet',
    description: 'Condiciones legales y normas de uso de la plataforma Klozet.',
    url: 'https://klozet.es/terms',
    type: 'website',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
