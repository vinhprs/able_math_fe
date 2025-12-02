import { format } from "date-fns";
import { ClipboardCheck } from "lucide-react";

interface RecentSubmission {
  id: string;
  testCode: string;
  studentName: string;
  submittedAt: string;
}

interface RecentSubmissionsListProps {
  submissions: RecentSubmission[];
}

export function RecentSubmissionsList({
  submissions,
}: RecentSubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <p>No recent submissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
        >
          <div className="bg-green-100 p-2 rounded-lg">
            <ClipboardCheck className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900">
              {submission.studentName}
            </p>
            <p className="text-xs text-secondary-500 font-mono">
              {submission.testCode}
            </p>
          </div>
          <div className="text-xs text-secondary-500">
            {format(new Date(submission.submittedAt), "MMM d, HH:mm")}
          </div>
        </div>
      ))}
    </div>
  );
}

