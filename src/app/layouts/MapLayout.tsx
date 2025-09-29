import Navigation from '@/components/layout/Navigation';

interface MapLayoutProps {
  children: React.ReactNode;
}

export default function MapLayout({ children }: MapLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
