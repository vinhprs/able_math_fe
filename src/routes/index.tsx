import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserRole } from "@shared/types/enum";
import { useAuthStore } from "@/store/authStore";

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
 * Root redirect component - redirects to appropriate dashboard based on role
 */
export function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

/**
 * Placeholder components for different role dashboards
 * These will be implemented later
 */
export function AdminDashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-secondary-600">
                Welcome back, {user?.fullName || user?.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-secondary-500">
            Admin dashboard content will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Teacher Dashboard
              </h1>
              <p className="mt-2 text-secondary-600">
                Welcome back, {user?.fullName || user?.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-secondary-500">
            Teacher dashboard content will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Student Dashboard
              </h1>
              <p className="mt-2 text-secondary-600">
                Welcome back, {user?.fullName || user?.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-secondary-500">
            Student dashboard content will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Application routes
 */
export default function createRoutes() {
  return createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/admin/dashboard",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Navigate to="/admin/dashboard" replace />
        </ProtectedRoute>
      ),
    },
    {
      path: "/teacher/dashboard",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
          <TeacherDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/teacher",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
          <Navigate to="/teacher/dashboard" replace />
        </ProtectedRoute>
      ),
    },
    {
      path: "/student/dashboard",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
          <StudentDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/student",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
          <Navigate to="/student/dashboard" replace />
        </ProtectedRoute>
      ),
    },
    {
      path: "/",
      element: <RootRedirect />,
    },
    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
  ]);
}
