import Protected from "@/components/app/Protected";
import AppHeader from "@/components/app/AppHeader";
import BottomNavOperational from "@/components/app/BottomNavOperational";
import { UserRole } from "@/lib/types";

export default function OperationalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={[UserRole.MANAGER, UserRole.WAITER]}>
      <div className="min-h-screen pb-16">
        <AppHeader variant="operational" />
        <div className="px-4 py-4">{children}</div>
        <BottomNavOperational />
      </div>
    </Protected>
  );
}