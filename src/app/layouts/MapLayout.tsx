import Navigation from '@/components/layout/Navigation';

interface MapLayoutProps {
  children: React.ReactNode;
}

export default function MapLayout({ children }: MapLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-16 lg:pt-0 pb-24 lg:pb-0">{children}</main>
    </div>
  );
}
