import { format } from "date-fns";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentTest {
  id: string;
  testCode: string;
  title: string;
  createdAt: string;
}

interface RecentTestsListProps {
  tests: RecentTest[];
}

export function RecentTestsList({ tests }: RecentTestsListProps) {
  const navigate = useNavigate();

  if (tests.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <p>No recent tests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 cursor-pointer transition-colors"
          onClick={() => navigate(`/admin/achievement-tests/${test.id}`)}
        >
          <div className="bg-primary-100 p-2 rounded-lg">
            <FileText className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {test.title}
            </p>
            <p className="text-xs text-secondary-500 font-mono">
              {test.testCode}
            </p>
          </div>
          <div className="text-xs text-secondary-500">
            {format(new Date(test.createdAt), "MMM d")}
          </div>
        </div>
      ))}
    </div>
  );
}
