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
import { AdtmTemplatesPage } from "@/pages/admin/adtm/AdtmTemplatesPage";

// Teacher Pages
import { TeacherDashboard } from "@/pages/teacher/Dashboard";
import { AdtmGrading } from "@/pages/teacher/adtm/AdtmGrading";
import { AdtmStudents } from "@/pages/teacher/adtm/AdtmStudents";
import { RegisterStudent } from "@/pages/teacher/adtm/RegisterStudent";
import { AdtmGradingEnhanced } from "@/pages/teacher/adtm/AdtmGradingEnhanced";
import { AssignStudentsPage } from "@/pages/teacher/adtm/AssignStudentsPage";
import { TeacherTestBrowse } from "@/pages/teacher/tests/TestBrowse";
import { AssignmentList } from "@/pages/teacher/assignments/AssignmentList";
import { AssignTest } from "@/pages/teacher/assignments/AssignTest";
import { AssignmentDetail } from "@/pages/teacher/assignments/AssignmentDetail";
import AssignTestWizard from "@/pages/teacher/AssignTestWizard";
import ClassList from "@/pages/teacher/classes/ClassList";
import ClassForm from "@/pages/teacher/classes/ClassForm";
import ClassDetails from "@/pages/teacher/classes/ClassDetails";

// Student Pages
import { StudentDashboard } from "@/pages/student/Dashboard";
import { StudentProfile } from "@/pages/student/Profile";
import { TestList as StudentTestList } from "@/pages/student/tests/TestList";
import { TakeTest } from "@/pages/student/tests/TakeTest";
import { TestPreview } from "@/pages/student/tests/TestPreview";
import { ReviewTest } from "@/pages/student/tests/ReviewTest";
import { ResultsList } from "@/pages/student/results/ResultsList";
import { ResultDetail } from "@/pages/student/results/ResultDetail";
import MyReports from "@/pages/student/MyReports";
import StudentReportDetail from "@/pages/student/StudentReportDetail";
import { AdtmReportPage } from "@/pages/reports/AdtmReportPage";
import { TeacherSubmissionsList } from "@/pages/teacher/submissions/SubmissionsList";
import { AdminSubmissionsList } from "@/pages/admin/submissions/AdminSubmissionsList";
import { AdminReportsList } from "@/pages/admin/AdminReportsList";

// Teacher Pages - Results
import { ResultReview } from "@/pages/teacher/results/ResultReview";
import PendingReports from "@/pages/teacher/PendingReports";
// Teacher Pages - A-DTM
import { AdtmGradingList } from "@/pages/teacher/adtm/AdtmGradingList";

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
                  path: "admin/adtm/templates",
                  element: <AdtmTemplatesPage />,
                },
                {
                  path: "admin/submissions",
                  element: <AdminSubmissionsList />,
                },
                {
                  path: "admin/reports",
                  element: <AdminReportsList />,
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
                  path: "teacher/reports/pending",
                  element: <PendingReports />,
                },
                {
                  path: "teacher/reports/:reportId/review",
                  element: <ResultReview />,
                },
                {
                  path: "teacher/reports",
                  element: <Navigate to="/teacher/reports/pending" replace />,
                },
                {
                  path: "teacher/adtm/students",
                  element: <AdtmStudents />,
                },
                {
                  path: "teacher/adtm/register",
                  element: <RegisterStudent />,
                },
                {
                  path: "teacher/adtm/assign",
                  element: <AssignStudentsPage />,
                },
                {
                  path: "teacher/grading",
                  element: <AdtmGradingList />,
                },
                {
                  path: "teacher/adtm/grade/:submissionId",
                  element: <AdtmGradingEnhanced />,
                },
                {
                  path: "teacher/adtm/:submissionId/grade",
                  element: <AdtmGrading />,
                },
                {
                  path: "teacher/tests/browse",
                  element: <TeacherTestBrowse />,
                },
                {
                  path: "teacher/assignments",
                  element: <AssignmentList />,
                },
                {
                  path: "teacher/assignments/assign",
                  element: <AssignTest />,
                },
                {
                  path: "teacher/assign-test",
                  element: <AssignTestWizard />,
                },
                {
                  path: "teacher/assignments/:id",
                  element: <AssignmentDetail />,
                },
                {
                  path: "teacher/classes",
                  element: <ClassList />,
                },
                {
                  path: "teacher/classes/new",
                  element: <ClassForm />,
                },
                {
                  path: "teacher/classes/:id/edit",
                  element: <ClassForm />,
                },
                {
                  path: "teacher/classes/:id",
                  element: <ClassDetails />,
                },
                {
                  path: "teacher/submissions",
                  element: <TeacherSubmissionsList />,
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
                  path: "student/tests/:assignmentId/take",
                  element: <TakeTest />,
                },
                {
                  path: "student/tests/:assignmentId/preview",
                  element: <TestPreview />,
                },
                {
                  path: "student/tests/:assignmentId",
                  element: <TestPreview />,
                },
                {
                  path: "student/tests/:testId/review",
                  element: <ReviewTest />,
                },
                {
                  path: "student/results",
                  element: <ResultsList />,
                },
                {
                  path: "student/results/:submissionId",
                  element: <ResultDetail />,
                },
                {
                  path: "student/reports",
                  element: <MyReports />,
                },
                {
                  path: "student/reports/:reportId",
                  element: <StudentReportDetail />,
                },
                {
                  path: "student/profile",
                  element: <StudentProfile />,
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
            // Report routes (accessible by all authenticated users)
            {
              path: "reports/adtm/:submissionId",
              element: <AdtmReportPage />,
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
