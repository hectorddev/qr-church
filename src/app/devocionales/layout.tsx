import Navigation from "@/components/layout/Navigation";

export default function DevocionalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9F6EE]">
      <Navigation />
      <main className="pt-16 lg:pt-20 pb-28 lg:pb-10 max-w-lg lg:max-w-2xl mx-auto px-4 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
