import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useStudentAssignments } from "@/hooks/useTestSubmissions";
import { SubmissionStatus } from "@shared/types/enum";
import { format } from "date-fns";
import { CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TestList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );
  const { data: assignments, isLoading } = useStudentAssignments(
    statusFilter !== "ALL" ? statusFilter : undefined
  );

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.NOT_STARTED:
        return <Badge variant="default">Not Started</Badge>;
      case SubmissionStatus.IN_PROGRESS:
        return <Badge variant="warning">In Progress</Badge>;
      case SubmissionStatus.SUBMITTED:
        return <Badge variant="info">Submitted</Badge>;
      case SubmissionStatus.GRADED:
        return <Badge variant="success">Graded</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleTestClick = (assignment: any) => {
    if (
      assignment.status === SubmissionStatus.NOT_STARTED ||
      assignment.status === SubmissionStatus.IN_PROGRESS
    ) {
      navigate(
        `/student/tests/${assignment.testId}/take?assignmentId=${assignment.assignmentId}`
      );
    } else {
      navigate(
        `/student/tests/${assignment.testId}/result?submissionId=${assignment.id}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">My Tests</h1>
          <p className="text-secondary-500 mt-1">
            View and take your assigned tests
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-secondary-700">
              Filter by Status:
            </label>
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as SubmissionStatus | "ALL")
              }
              className="w-48"
              options={[
                { value: "ALL", label: "All Tests" },
                { value: SubmissionStatus.NOT_STARTED, label: "Not Started" },
                { value: SubmissionStatus.IN_PROGRESS, label: "In Progress" },
                { value: SubmissionStatus.SUBMITTED, label: "Submitted" },
                { value: SubmissionStatus.GRADED, label: "Graded" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      {!assignments || assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-secondary-400 mb-4" />
            <p className="text-secondary-600">No tests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTestClick(assignment)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-secondary-900">
                        {assignment.title}
                      </h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary-600 mt-2">
                      <span className="font-mono">{assignment.testCode}</span>
                      {assignment.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due:{" "}
                          {format(
                            new Date(assignment.deadline),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </span>
                      )}
                      {assignment.assignedAt && (
                        <span>
                          Assigned:{" "}
                          {format(
                            new Date(assignment.assignedAt),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      )}
                    </div>
                    {assignment.submittedAt && (
                      <div className="mt-2 text-sm text-secondary-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Submitted:{" "}
                          {format(
                            new Date(assignment.submittedAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </span>
                      </div>
                    )}
                    {assignment.score !== null && (
                      <div className="mt-2">
                        <span className="text-lg font-semibold text-primary-600">
                          Score: {assignment.score.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button
                      variant={
                        assignment.status === SubmissionStatus.GRADED
                          ? "secondary"
                          : "primary"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestClick(assignment);
                      }}
                    >
                      {assignment.status === SubmissionStatus.NOT_STARTED &&
                        "Start Test"}
                      {assignment.status === SubmissionStatus.IN_PROGRESS &&
                        "Continue Test"}
                      {assignment.status === SubmissionStatus.SUBMITTED &&
                        "View Submission"}
                      {assignment.status === SubmissionStatus.GRADED &&
                        "View Results"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
