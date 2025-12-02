import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Calendar,
  GraduationCap,
  Plus,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import {
  DashboardCard,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ClassesList, UpcomingDeadlinesList } from "@/components/dashboard";
import { useTeacherStats, useMyClasses } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useTeacherStats();
  const { data: classes, isLoading: classesLoading } = useMyClasses();

  if (statsLoading || classesLoading) {
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
          Teacher Dashboard
        </h1>
        <p className="text-secondary-500 mt-1">
          Manage your classes and assignments
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="My Classes"
          value={stats?.totalClasses || 0}
          icon={Users}
          onClick={() => navigate("/teacher/classes")}
        />
        <DashboardCard
          title="Pending Grading"
          value={stats?.pendingGrading || 0}
          icon={ClipboardList}
          onClick={() => navigate("/teacher/grading")}
        />
        <DashboardCard
          title="This Week's Tests"
          value={stats?.thisWeekTests || 0}
          icon={Calendar}
        />
        <DashboardCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={GraduationCap}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/teacher/assignments/assign")}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Test
            </Button>
            <Button
              onClick={() => navigate("/teacher/grading")}
              variant="secondary"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Grade A-DTM
            </Button>
            <Button
              onClick={() => navigate("/teacher/reports")}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassesList classes={classes || []} />
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingDeadlinesList />
        </CardContent>
      </Card>
    </div>
  );
}
