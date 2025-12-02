import { format, isAfter, isBefore, addDays } from "date-fns";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { useUpcomingDeadlines } from "@/hooks/useDashboard";

export function UpcomingDeadlinesList() {
  const navigate = useNavigate();
  const { data: deadlines = [] } = useUpcomingDeadlines();

  if (deadlines.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <p>No upcoming deadlines</p>
      </div>
    );
  }

  const isUrgent = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return isAfter(now, due) || isBefore(due, addDays(now, 3));
  };

  return (
    <div className="space-y-3">
      {deadlines.map((deadline) => {
        const urgent = isUrgent(deadline.dueDate);
        return (
          <div
            key={deadline.id}
            className="flex items-center justify-between p-3 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors cursor-pointer"
            onClick={() => navigate(`/teacher/assignments/${deadline.id}`)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`p-2 rounded-lg ${
                  urgent ? "bg-red-100" : "bg-yellow-100"
                }`}
              >
                <Calendar
                  className={`w-4 h-4 ${
                    urgent ? "text-red-600" : "text-yellow-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-secondary-900">
                    {deadline.title}
                  </p>
                  {urgent && (
                    <Badge variant="danger" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-secondary-500 font-mono">
                  {deadline.testCode}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-secondary-900">
                {format(new Date(deadline.dueDate), "MMM d, yyyy")}
              </p>
              {deadline.pendingGrading > 0 && (
                <p className="text-xs text-secondary-500">
                  {deadline.pendingGrading} pending
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

