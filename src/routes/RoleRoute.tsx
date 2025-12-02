import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@shared/types/enum";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

/**
 * Get dashboard route based on user role
 */
function getDashboardRoute(role: UserRole): string {
  const roleRoutes: Record<UserRole, string> = {
    [UserRole.ADMIN]: "/admin/dashboard",
    [UserRole.TEACHER]: "/teacher/dashboard",
    [UserRole.STUDENT]: "/student/dashboard",
  };
  return roleRoutes[role] || "/login";
}

/**
 * Role-based route protection component
 * Uses Outlet to render nested routes
 */
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they have a different role
    const redirectPath = user ? getDashboardRoute(user.role) : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
