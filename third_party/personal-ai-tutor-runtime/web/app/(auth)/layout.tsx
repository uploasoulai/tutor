import { CoastalTutorHomeLink } from "@/components/layout/CoastalTutorHomeLink";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <CoastalTutorHomeLink className="fixed left-4 top-3 z-50" />
      {children}
    </div>
  );
}
