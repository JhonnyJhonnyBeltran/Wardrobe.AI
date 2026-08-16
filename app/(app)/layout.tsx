import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/components/AppLayout';

export default function AppGroupedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>{children}</AppLayout>
  );
}
