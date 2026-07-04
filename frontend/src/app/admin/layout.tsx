export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* AdminHeader */}
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
