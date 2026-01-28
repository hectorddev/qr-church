import Navigation from '@/components/layout/Navigation';

export default function PremiosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navigation />
            <main className="pt-16 lg:pt-0 pb-24 lg:pb-0">{children}</main>
        </div>
    );
}
