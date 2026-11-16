import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — La Historia de Klozet',
  description: 'Conoce la historia detrás de Klozet: la red social de moda y armario virtual inteligente para organizar tu ropa y descubrir inspiración diaria.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Sobre Nosotros — La Historia de Klozet',
    description: 'De saltar entre Pinterest, Instagram y Zara a tener tu armario en el bolsillo. Conoce a los creadores de Klozet.',
    url: 'https://klozet.es/about',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
