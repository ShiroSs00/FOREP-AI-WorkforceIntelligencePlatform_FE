import { RequireAuth } from "@/auth/require-auth";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}




