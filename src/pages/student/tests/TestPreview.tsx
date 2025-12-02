import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, FileText, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import api from '@/lib/api';
import { formatDateTime, formatDateShort } from '@/lib/utils';
import { toastError } from '@/lib/toast';

export function TestPreview() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Fetch assignment details
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['student-assignment', assignmentId],
    queryFn: async () => {
      try {
        const response = await api.get(`/student/assignments/${assignmentId}`);
        return response.data.data || response.data;
      } catch (error: any) {
        toastError(error.response?.data?.message || 'Failed to load assignment');
        throw error;
      }
    },
    enabled: !!assignmentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Assignment not found</p>
          <Button onClick={() => navigate('/student/tests')}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const test = assignment.test;
  const canStart = assignment.status === 'PENDING' || assignment.status === 'IN_PROGRESS';
  const isOverdue = assignment.isOverdue;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/tests')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Test Preview</h1>
          <p className="text-gray-600 mt-2">
            Review test information before starting
          </p>
        </div>

        {/* Overdue Warning */}
        {isOverdue && (
          <Alert variant="danger" className="mb-6">
            <Clock className="w-5 h-5" />
            <div className="ml-3">
              <h3 className="font-bold">This test is overdue</h3>
              <p className="text-sm mt-1">
                The deadline has passed. Please contact your teacher if you need
                an extension.
              </p>
            </div>
          </Alert>
        )}

        {/* Test Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{test.title}</span>
              <Badge variant="info">{test.testCode}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Test Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Score</p>
                    <p className="font-bold text-lg">{test.totalScore} points</p>
                  </div>
                </div>

                {assignment.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p
                        className={`font-bold text-lg ${
                          isOverdue ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {formatDateTime(assignment.deadline)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned By</p>
                    <p className="font-medium">{assignment.assignedBy.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant={
                        assignment.status === 'GRADED'
                          ? 'success'
                          : assignment.status === 'SUBMITTED'
                          ? 'info'
                          : assignment.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {assignment.status === 'PENDING'
                        ? 'Not Started'
                        : assignment.status === 'IN_PROGRESS'
                        ? 'In Progress'
                        : assignment.status === 'SUBMITTED'
                        ? 'Submitted'
                        : 'Graded'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              {assignment.submission && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Submission Details</p>
                  <div className="space-y-2">
                    {assignment.submission.submittedAt && (
                      <p className="text-sm">
                        Submitted:{' '}
                        <span className="font-medium">
                          {formatDateShort(assignment.submission.submittedAt)}
                        </span>
                      </p>
                    )}
                    {assignment.submission.score !== null &&
                      assignment.submission.score !== undefined && (
                        <p className="text-sm">
                          Score:{' '}
                          <span className="font-bold text-primary-600">
                            {assignment.submission.score}%
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>
                  Read each question carefully before answering
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>
                  Your answers are automatically saved as you type
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>
                  You can navigate between questions and review your answers
                  before submitting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>
                  Once submitted, you cannot change your answers
                </span>
              </li>
              {assignment.deadline && (
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span>
                    Make sure to submit before the deadline:{' '}
                    <span className="font-medium">
                      {formatDateTime(assignment.deadline)}
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/student/tests')}
            className="flex-1"
          >
            Back to Tests
          </Button>
          {canStart && (
            <Button
              onClick={() => navigate(`/student/tests/${assignmentId}/take`)}
              className="flex-1"
            >
              {assignment.status === 'PENDING' ? 'Start Test' : 'Continue Test'}
            </Button>
          )}
          {assignment.status === 'GRADED' && assignment.submission && (
            <Button
              onClick={() =>
                navigate(`/student/results/${assignment.submission.id}`)
              }
              className="flex-1"
            >
              View Results
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

