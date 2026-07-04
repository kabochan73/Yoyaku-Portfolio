import { SiteHeader } from "./_components/SiteHeader";
import { Footer } from "./_components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
