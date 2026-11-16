import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto y Soporte',
  description: '¿Tienes dudas, sugerencias o necesitas soporte en Klozet? Contacta directamente con nuestro equipo de atención al usuario.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contacto y Soporte | Klozet',
    description: 'Estamos aquí para ayudarte. Escríbenos sobre tu cuenta, sugerencias o colaboraciones.',
    url: 'https://klozet.es/contact',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
