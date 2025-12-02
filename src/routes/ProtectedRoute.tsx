import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@shared/types/enum";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
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
 * Protected route component that checks authentication and optionally role-based access
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, initialize } = useAuthStore();
  const location = useLocation();

  // Initialize auth on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      initialize();
    }
  }, [isAuthenticated, isLoading, initialize]);

  // Show loading state while checking authentication
  if (isLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="h-8 w-8 animate-spin text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
