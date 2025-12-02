import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import {
  Button,
  Input,
  Checkbox,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { UserRole } from "@shared/types/enum";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Login page component
 */
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
 * Login page component
 */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError, user } =
    useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname;
      const targetRoute = from || getDashboardRoute(user.role);
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    clearError();
    try {
      await login({
        username: data.username,
        password: data.password,
      });
      // Navigation will happen in useEffect when isAuthenticated changes
    } catch (err: any) {
      // Format error message
      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const message = err.response.data?.message;

        if (status === 401) {
          errorMessage =
            "Invalid username or password. Please check your credentials.";
        } else if (status === 403) {
          errorMessage = "Access denied. Please contact your administrator.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (message) {
          errorMessage = Array.isArray(message) ? message.join(", ") : message;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setSubmitError(errorMessage);
      console.error("Login error:", err);
    }
  };

  // Use error from store or local submit error
  const displayError = submitError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Able Math
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              placeholder="Enter your username or email"
              autoComplete="username"
              error={errors.username?.message}
              disabled={isLoading}
              {...register("username")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              disabled={isLoading}
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                {...register("rememberMe")}
                disabled={isLoading}
              />
            </div>

            {displayError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{displayError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
