import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@shared/types/enum";

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

export function NotFound() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      navigate(getDashboardRoute(user.role));
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-secondary-600">Page not found</p>
          <p className="text-sm text-secondary-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

