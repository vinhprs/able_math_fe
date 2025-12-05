import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUsers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import {
  ArrowLeft,
  Mail,
  Phone,
  School,
  GraduationCap,
  User,
  Calendar,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useUser(id || null);
  const student = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">
              {error instanceof Error
                ? error.message
                : "Failed to load student"}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/students")}
            >
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-secondary-600">Student not found</p>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/students")}
              className="mt-4"
            >
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {student.fullName}
          </h1>
          <p className="text-gray-500 mt-1">Student Details</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/teacher/students")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          {(!student.username || !student.email) && (
            <p className="text-sm text-amber-600 mt-2">
              Some required information is missing. Please update the student
              profile.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-base text-gray-900">
                  {student.username || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">
                  {student.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <School className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="text-base text-gray-900">
                  {student.school || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Grade</p>
                <p className="text-base text-gray-900">
                  {student.grade || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Created
                </p>
                <p className="text-base text-gray-900">
                  {student.createdAt
                    ? format(new Date(student.createdAt), "MMM dd, yyyy")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge
                  variant={student.isActive ? "success" : "danger"}
                  className="mt-1"
                >
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Information */}
      {student.parentName || student.parentContact ? (
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.parentName && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Parent Name
                    </p>
                    <p className="text-base text-gray-900">
                      {student.parentName}
                    </p>
                  </div>
                </div>
              )}

              {student.parentContact && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Parent Contact
                    </p>
                    <p className="text-base text-gray-900">
                      {student.parentContact}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <Badge variant="default" className="mt-1">
                {student.role || "-"}
              </Badge>
            </div>

            {student.creator && (
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="text-base text-gray-900 mt-1">
                  {student.creator.fullName} ({student.creator.username})
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-base text-gray-900 mt-1">
                {student.createdAt
                  ? format(
                      new Date(student.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-base text-gray-900 mt-1">
                {student.updatedAt
                  ? format(
                      new Date(student.updatedAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => {
            navigate("/teacher/students");
            // Trigger edit mode - you might want to pass state or use a different approach
          }}
        >
          Back to List
        </Button>
        <Button
          onClick={() => {
            // Navigate to edit - you might want to implement edit functionality
            navigate(`/teacher/students?edit=${student.id}`);
          }}
        >
          Edit Student
        </Button>
      </div>
    </div>
  );
}
