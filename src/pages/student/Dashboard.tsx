import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  FileText,
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
import { StudentTestsList, LineChart } from "@/components/dashboard";
import { useStudentStats, useMyTests } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: tests, isLoading: testsLoading } = useMyTests();

  if (statsLoading || testsLoading) {
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
        <h1 className="text-3xl font-bold text-secondary-900">My Dashboard</h1>
        <p className="text-secondary-500 mt-1">Track your tests and results</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Pending Tests"
          value={stats?.pendingTests || 0}
          icon={Clock}
          onClick={() => navigate("/student/tests")}
        />
        <DashboardCard
          title="Completed"
          value={stats?.completedTests || 0}
          icon={CheckCircle}
        />
        <DashboardCard
          title="Average Score"
          value={`${stats?.averageScore || 0}%`}
          icon={TrendingUp}
        />
        <DashboardCard
          title="Latest Result"
          value={`${stats?.latestScore || 0}%`}
          icon={Award}
          onClick={() =>
            stats?.latestResultId &&
            navigate(`/student/results/${stats.latestResultId}`)
          }
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/student/tests")}>
              <FileText className="w-4 h-4 mr-2" />
              View All Tests
            </Button>
            <Button
              onClick={() => navigate("/student/results")}
              variant="secondary"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Tests */}
      <Card>
        <CardHeader>
          <CardTitle>My Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTestsList tests={tests || ([] as any[])} />
        </CardContent>
      </Card>

      {/* Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={stats?.scoreTrend} />
        </CardContent>
      </Card>
    </div>
  );
}
