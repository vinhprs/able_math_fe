import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "@/components/ui";
import { FileText, Play, Eye } from "lucide-react";
import { SubmissionStatus } from "@shared/types/enum";

interface StudentTest {
  id: string;
  testId: string;
  testCode: string;
  title: string;
  status: SubmissionStatus;
  dueDate: string | null;
  submittedAt: string | null;
  score: number | null;
}

interface StudentTestsListProps {
  tests: StudentTest[];
}

export function StudentTestsList({ tests }: StudentTestsListProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: SubmissionStatus) => {
    const variants: Record<
      SubmissionStatus,
      "default" | "success" | "warning" | "info"
    > = {
      [SubmissionStatus.NOT_STARTED]: "default",
      [SubmissionStatus.IN_PROGRESS]: "warning",
      [SubmissionStatus.SUBMITTED]: "info",
      [SubmissionStatus.GRADED]: "success",
    };

    const labels: Record<SubmissionStatus, string> = {
      [SubmissionStatus.NOT_STARTED]: "Not Started",
      [SubmissionStatus.IN_PROGRESS]: "In Progress",
      [SubmissionStatus.SUBMITTED]: "Submitted",
      [SubmissionStatus.GRADED]: "Graded",
    };

    return (
      <Badge variant={variants[status]}>{labels[status]}</Badge>
    );
  };

  const getActionButton = (test: StudentTest) => {
    if (test.status === SubmissionStatus.NOT_STARTED) {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/student/tests/${test.id}/take`)}
        >
          <Play className="w-4 h-4 mr-2" />
          Take Test
        </Button>
      );
    }
    if (test.status === SubmissionStatus.IN_PROGRESS) {
      return (
        <Button
          size="sm"
          onClick={() => navigate(`/student/tests/${test.id}/continue`)}
        >
          <Play className="w-4 h-4 mr-2" />
          Continue
        </Button>
      );
    }
    if (test.status === SubmissionStatus.GRADED && test.score !== null) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/student/results/${test.id}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Result
        </Button>
      );
    }
    return null;
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <p>No tests assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-secondary-900">{test.title}</h3>
                {getStatusBadge(test.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary-500">
                <span className="font-mono">{test.testCode}</span>
                {test.dueDate && (
                  <span>Due: {format(new Date(test.dueDate), "MMM d, yyyy")}</span>
                )}
                {test.score !== null && (
                  <span className="font-semibold text-secondary-900">
                    Score: {test.score}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>{getActionButton(test)}</div>
        </div>
      ))}
    </div>
  );
}

