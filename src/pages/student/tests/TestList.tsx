import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  Eye,
  Calendar,
  X,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import {
  useStudentAssignments,
  useAssignmentStats,
  useUpcomingDeadlines,
  type StudentAssignment,
  type StudentAssignmentFilters,
} from '@/hooks/useStudentAssignments';
import { formatDateShort, formatDateTime, formatTimeRemaining } from '@/lib/utils';

interface TestFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  overdue?: boolean;
  page: number;
  limit: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      {startPage > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

function TestCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-secondary-200 rounded w-3/4" />
        <div className="h-4 bg-secondary-200 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-secondary-200 rounded" />
          <div className="h-12 bg-secondary-200 rounded" />
        </div>
        <div className="h-10 bg-secondary-200 rounded" />
      </div>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'yellow' | 'red' | 'green';
  onClick?: () => void;
}

function StatCard({ label, value, icon: Icon, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    green: 'text-green-600 bg-green-100',
  };

  return (
    <Card
      className={`p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-500">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
}

interface TestCardProps {
  assignment: StudentAssignment;
  onAction: (action: string, id: string) => void;
}

function TestCard({ assignment, onAction }: TestCardProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        badge: { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string; icon: typeof Clock };
        action: { label: string; icon: typeof Play; variant: 'primary' | 'outline'; action: string | null };
      }
    > = {
      PENDING: {
        badge: { variant: 'info', label: 'Not Started', icon: Clock },
        action: { label: 'Start Test', icon: Play, variant: 'primary', action: 'start' },
      },
      IN_PROGRESS: {
        badge: { variant: 'warning', label: 'In Progress', icon: FileText },
        action: { label: 'Continue', icon: ArrowRight, variant: 'primary', action: 'continue' },
      },
      SUBMITTED: {
        badge: { variant: 'default', label: 'Submitted', icon: CheckCircle },
        action: { label: 'Waiting for Grade', icon: Clock, variant: 'outline', action: null },
      },
      GRADED: {
        badge: { variant: 'success', label: 'Graded', icon: CheckCircle },
        action: { label: 'View Results', icon: Eye, variant: 'primary', action: 'view' },
      },
    };
    return configs[status] || configs.PENDING;
  };

  const config = getStatusConfig(assignment.status);
  const StatusIcon = config.badge.icon;
  const ActionIcon = config.action.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg line-clamp-2">{assignment.test.title}</h3>
            <Badge variant={config.badge.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.badge.label}
            </Badge>
          </div>
          <p className="text-sm text-secondary-500">{assignment.test.testCode}</p>
        </div>

        {/* Test Info */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-secondary-200 text-sm">
          <div>
            <p className="text-secondary-500">Total Score</p>
            <p className="font-bold text-secondary-900">{assignment.test.totalScore}</p>
          </div>
          {assignment.submission?.score !== undefined && assignment.submission?.score !== null ? (
            <div>
              <p className="text-secondary-500">Your Score</p>
              <p className="font-bold text-primary-600">{assignment.submission.score}%</p>
            </div>
          ) : (
            <div>
              <p className="text-secondary-500">Assigned By</p>
              <p className="font-medium text-secondary-900">{assignment.assignedBy.fullName}</p>
            </div>
          )}
        </div>

        {/* Deadline Info */}
        {assignment.deadline && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deadline
              </span>
              <span className={`font-medium ${assignment.isOverdue ? 'text-red-600' : 'text-secondary-900'}`}>
                {formatDateTime(assignment.deadline)}
              </span>
            </div>

            {assignment.isOverdue ? (
              <Alert variant="danger" size="sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="ml-2">Overdue!</span>
              </Alert>
            ) : assignment.deadline ? (
              (() => {
                const now = new Date();
                const deadline = new Date(assignment.deadline);
                const diff = deadline.getTime() - now.getTime();
                if (diff > 0) {
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  return (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-primary-600 font-medium">
                        {formatTimeRemaining(days, hours)} remaining
                      </span>
                    </div>
                  );
                }
                return null;
              })()
            ) : null}
          </div>
        )}

        {/* Submitted Info */}
        {assignment.submission?.submittedAt && (
          <div className="text-sm text-secondary-500">
            Submitted: {formatDateShort(assignment.submission.submittedAt)}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onAction('preview', assignment.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          {config.action.action && (
            <Button
              size="sm"
              variant={config.action.variant}
              className="flex-1"
              onClick={() => onAction(config.action.action as string, assignment.id)}
            >
              <ActionIcon className="w-4 h-4 mr-2" />
              {config.action.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'GRADED', label: 'Graded' },
];

export function TestList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TestFilters>({ page: 1, limit: 12 });

  // Fetch assignments
  const { data: assignmentsData, isLoading } = useStudentAssignments(filters);

  // Fetch statistics
  const { data: stats } = useAssignmentStats();

  // Fetch upcoming deadlines
  const { data: upcomingDeadlines } = useUpcomingDeadlines();

  const handleFilterChange = (key: keyof TestFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
  };

  const hasActiveFilters = filters.status || filters.overdue;

  const handleAction = (action: string, assignmentId: string) => {
    const assignment = assignmentsData?.data.find((a) => a.id === assignmentId);
    if (!assignment) return;

    if (action === 'start' || action === 'continue') {
      navigate(`/student/tests/${assignmentId}/take`);
    } else if (action === 'view' && assignment.submission) {
      navigate(`/student/results/${assignment.submission.id}`);
    } else if (action === 'preview') {
      navigate(`/student/tests/${assignmentId}/preview`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">My Tests</h1>
        <p className="text-secondary-500">View and take your assigned tests</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Tests"
            value={stats.total}
            icon={FileText}
            color="blue"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
            onClick={() => handleFilterChange('status', 'PENDING')}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color="red"
            onClick={() => handleFilterChange('overdue', true)}
          />
          <StatCard
            label="Completed"
            value={stats.graded}
            icon={CheckCircle}
            color="green"
          />
        </div>
      )}

      {/* Overdue Warning */}
      {stats && stats.overdue > 0 && (
        <Alert variant="danger">
          <AlertTriangle className="w-5 h-5" />
          <div className="ml-3">
            <h3 className="font-bold">You have {stats.overdue} overdue test(s)</h3>
            <p className="text-sm mt-1">Please complete them as soon as possible.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => handleFilterChange('overdue', true)}
          >
            View Overdue
          </Button>
        </Alert>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines && upcomingDeadlines.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-2">
            {upcomingDeadlines.slice(0, 3).map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-center justify-between p-2 bg-white rounded"
              >
                <div>
                  <p className="font-medium text-sm">{deadline.testTitle}</p>
                  <p className="text-xs text-secondary-500">{deadline.testCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">
                    {formatTimeRemaining(deadline.timeRemaining.days, deadline.timeRemaining.hours)}
                  </p>
                  <p className="text-xs text-secondary-500">{formatDateShort(deadline.deadline)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-end gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Overdue Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Deadline</label>
            <Select
              value={filters.overdue ? 'overdue' : ''}
              onChange={(e) => handleFilterChange('overdue', e.target.value === 'overdue')}
              options={[
                { value: '', label: 'All' },
                { value: 'overdue', label: 'Overdue Only' },
              ]}
            />
          </div>

          {/* Clear Button */}
          <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </Card>

      {/* Test Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <TestCardSkeleton key={i} />
          ))}
        </div>
      ) : assignmentsData && assignmentsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignmentsData.data.map((assignment) => (
              <TestCard key={assignment.id} assignment={assignment} onAction={handleAction} />
            ))}
          </div>

          {/* Pagination */}
          {assignmentsData && assignmentsData.totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={assignmentsData.totalPages}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No tests found</h3>
          <p className="text-secondary-500">
            {hasActiveFilters ? 'Try adjusting your filters' : 'You have no assigned tests yet'}
          </p>
        </Card>
      )}
    </div>
  );
}