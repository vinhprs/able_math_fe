import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/shared/types/enum";
import { Header } from "./Header";
import { AdminSidebar } from "./AdminSidebar";
import { TeacherSidebar } from "./TeacherSidebar";
import { StudentSidebar } from "./StudentSidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuthStore();

  const renderSidebar = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return <AdminSidebar />;
      case UserRole.TEACHER:
        return <TeacherSidebar />;
      case UserRole.STUDENT:
        return <StudentSidebar />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
