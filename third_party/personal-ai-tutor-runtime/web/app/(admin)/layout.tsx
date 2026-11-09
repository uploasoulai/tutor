import { CoastalTutorHomeLink } from "@/components/layout/CoastalTutorHomeLink";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CoastalTutorHomeLink className="fixed left-4 top-3 z-50" />
      {children}
    </div>
  );
}
