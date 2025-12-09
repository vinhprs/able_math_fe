import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  FileText,
  ClipboardCheck,
  Plus,
  UserPlus,
  BarChart3,
} from "lucide-react";
import {
  DashboardCard,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  RecentTestsList,
  RecentSubmissionsList,
  BarChart,
  LineChart,
} from "@/components/dashboard";
import { useAdminStats, useRecentActivity } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentActivity();

  if (statsLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          Admin Dashboard
        </h1>
        <p className="text-secondary-500 mt-1">
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={GraduationCap}
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate("/admin/students")}
        />
        <DashboardCard
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          icon={Users}
          onClick={() => navigate("/admin/teachers")}
        />
        <DashboardCard
          title="Total Tests"
          value={stats?.totalTests || 0}
          icon={FileText}
          onClick={() => navigate("/admin/achievement-tests")}
        />
        <DashboardCard
          title="Active Submissions"
          value={stats?.activeSubmissions || 0}
          icon={ClipboardCheck}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate("/admin/achievement-tests/create")}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
            <Button
              onClick={() => navigate("/admin/teachers/create")}
              variant="secondary"
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
            <Button
              onClick={() => navigate("/admin/students/create")}
              variant="secondary"
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
            <Button
              onClick={() => navigate("/admin/reports")}
              variant="outline"
              className="w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTestsList tests={recentActivity?.tests || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSubmissionsList
              submissions={recentActivity?.submissions || []}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tests by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={stats?.testsByGrade} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={stats?.submissionsThisWeek} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
