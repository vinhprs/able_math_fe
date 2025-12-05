import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui';
import { FileCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { SubmissionStatus } from '@shared/types/enum';

interface AdtmSubmissionListItem {
  id: string;
  student: {
    id: string;
    name: string;
    studentId: string;
    grade: string;
  };
  test: {
    id: string;
    testCode: string;
    title: string;
  };
  status: SubmissionStatus;
  testDate: Date;
  overallScore: number | null;
  progress: number;
}

interface AdtmSubmissionsResponse {
  submissions: AdtmSubmissionListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: SubmissionStatus.NOT_STARTED, label: 'Not Started' },
  { value: SubmissionStatus.IN_PROGRESS, label: 'In Progress' },
  { value: SubmissionStatus.SUBMITTED, label: 'Submitted' },
  { value: SubmissionStatus.GRADED, label: 'Graded' },
];

export function AdtmGradingList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '' as string,
    search: '',
  });

  const { data, isLoading, error } = useQuery<AdtmSubmissionsResponse>({
    queryKey: ['adtm-submissions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get<{
        success: boolean;
        data: AdtmSubmissionsResponse;
        timestamp: string;
      }>(`/teacher/adtm/submissions?${params.toString()}`);
      return response.data.data;
    },
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    const variants: Record<
      SubmissionStatus,
      'default' | 'success' | 'warning' | 'danger'
    > = {
      [SubmissionStatus.NOT_STARTED]: 'default',
      [SubmissionStatus.IN_PROGRESS]: 'warning',
      [SubmissionStatus.SUBMITTED]: 'warning',
      [SubmissionStatus.GRADED]: 'success',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading submissions</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">A-DTM Grading</h1>
        <p className="text-secondary-500 mt-1">
          Manage and grade A-DTM test submissions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by student name or test code..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
                }
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))
                }
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Submissions ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.submissions.length === 0 ? (
            <div className="text-center py-12 text-secondary-500">
              No submissions found
            </div>
          ) : (
            <div className="space-y-4">
              {data?.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border rounded-lg p-4 hover:bg-secondary-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/teacher/adtm/grade/${submission.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {submission.student.name}
                        </h3>
                        <Badge variant="default">{submission.student.grade}</Badge>
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="text-sm text-secondary-600 space-y-1">
                        <div>
                          <span className="font-medium">Test:</span>{' '}
                          {submission.test.testCode} - {submission.test.title}
                        </div>
                        <div>
                          <span className="font-medium">Test Date:</span>{' '}
                          {format(new Date(submission.testDate), 'MMM dd, yyyy')}
                        </div>
                        {submission.overallScore !== null && (
                          <div>
                            <span className="font-medium">Overall Score:</span>{' '}
                            <span className="text-primary-600 font-semibold">
                              {submission.overallScore.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-secondary-500 mb-1">
                          <span>Progress</span>
                          <span>{submission.progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(submission.progress)} transition-all`}
                            style={{ width: `${submission.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/adtm/grade/${submission.id}`);
                        }}
                      >
                        <FileCheck className="w-4 h-4 mr-2" />
                        {submission.status === SubmissionStatus.GRADED
                          ? 'View'
                          : 'Grade'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-secondary-600">
                Page {data.page} of {data.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={filters.page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

