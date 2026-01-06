import Protected from "@/components/app/Protected";
import AppHeader from "@/components/app/AppHeader";
import AdminNav from "@/components/app/AdminNav";
import { UserRole } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={[UserRole.MANAGER]}>
      <div className="min-h-screen">
        <AppHeader variant="admin" />
        <div className="px-4 py-4">
          <AdminNav />
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </Protected>
  );
}