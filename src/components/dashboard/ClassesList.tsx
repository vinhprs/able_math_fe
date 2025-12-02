import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

interface Class {
  id: string;
  name: string;
  studentCount: number;
  recentActivity: string;
}

interface ClassesListProps {
  classes: Class[];
}

export function ClassesList({ classes }: ClassesListProps) {
  const navigate = useNavigate();

  if (classes.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <p>No classes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classItem) => (
        <div
          key={classItem.id}
          className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">
                {classItem.name}
              </h3>
              <p className="text-sm text-secondary-500">
                {classItem.studentCount} students • {classItem.recentActivity}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teacher/classes/${classItem.id}`)}
          >
            View
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ))}
    </div>
  );
}

