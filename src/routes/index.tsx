import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { LayoutRoute } from "./LayoutRoute";
import { UserRole } from "@shared/types/enum";
import { useAuthStore } from "@/store/authStore";
import { NotFound } from "@/pages/NotFound";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { TestList } from "@/pages/admin/tests/TestList";
import { TestCreate } from "@/pages/admin/tests/TestCreate";
import { TestEdit } from "@/pages/admin/tests/TestEdit";
import { TestDetail } from "@/pages/admin/tests/TestDetail";

// Teacher Pages
import { TeacherDashboard } from "@/pages/teacher/Dashboard";
import { AdtmGrading } from "@/pages/teacher/adtm/AdtmGrading";

// Student Pages
import { StudentDashboard } from "@/pages/student/Dashboard";
import { TestList as StudentTestList } from "@/pages/student/tests/TestList";
import { TakeTest } from "@/pages/student/tests/TakeTest";
import { ReviewTest } from "@/pages/student/tests/ReviewTest";
import { ResultDetail } from "@/pages/student/results/ResultDetail";

// Teacher Pages - Results
import { ResultReview } from "@/pages/teacher/results/ResultReview";

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
 * Application routes using React Router v6 nested routes
 */
export default function createRoutes() {
  return createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: <RootRedirect />,
        },
        {
          element: <LayoutRoute />,
          children: [
            // Admin Routes
            {
              element: <RoleRoute allowedRoles={[UserRole.ADMIN]} />,
              children: [
                {
                  path: "admin/dashboard",
                  element: <AdminDashboard />,
                },
                {
                  path: "admin/tests/achievement",
                  element: <TestList />,
                },
                {
                  path: "admin/tests/achievement/create",
                  element: <TestCreate />,
                },
                {
                  path: "admin/tests/achievement/:id/edit",
                  element: <TestEdit />,
                },
                {
                  path: "admin/tests/adtm",
                  element: (
                    <div className="max-w-7xl mx-auto">
                      <h1 className="text-3xl font-bold text-secondary-900">
                        A-DTM Tests
                      </h1>
                      <p className="mt-2 text-secondary-600">
                        A-DTM test management will be implemented here.
                      </p>
                    </div>
                  ),
                },
                {
                  path: "admin",
                  element: <Navigate to="/admin/dashboard" replace />,
                },
              ],
            },
            // Teacher Routes
            {
              element: <RoleRoute allowedRoles={[UserRole.TEACHER]} />,
              children: [
                {
                  path: "teacher/dashboard",
                  element: <TeacherDashboard />,
                },
                {
                  path: "teacher/adtm/:submissionId/grade",
                  element: <AdtmGrading />,
                },
                {
                  path: "teacher/results/:submissionId",
                  element: <ResultReview />,
                },
                {
                  path: "teacher",
                  element: <Navigate to="/teacher/dashboard" replace />,
                },
              ],
            },
            // Student Routes
            {
              element: <RoleRoute allowedRoles={[UserRole.STUDENT]} />,
              children: [
                {
                  path: "student/dashboard",
                  element: <StudentDashboard />,
                },
                {
                  path: "student/tests",
                  element: <StudentTestList />,
                },
                {
                  path: "student/tests/:testId/take",
                  element: <TakeTest />,
                },
                {
                  path: "student/tests/:testId/review",
                  element: <ReviewTest />,
                },
                {
                  path: "student/results/:submissionId",
                  element: <ResultDetail />,
                },
                {
                  path: "student",
                  element: <Navigate to="/student/dashboard" replace />,
                },
              ],
            },
            // Shared routes (accessible by multiple roles)
            {
              element: (
                <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]} />
              ),
              children: [
                {
                  path: "admin/tests/achievement/:id",
                  element: <TestDetail />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
}
