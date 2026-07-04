export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex flex-1 flex-col items-center justify-center">{children}</main>;
}
