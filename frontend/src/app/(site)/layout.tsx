import { Footer } from "./_components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
