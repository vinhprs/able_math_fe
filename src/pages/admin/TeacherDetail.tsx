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
import { ArrowLeft, Mail, School, User, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useUser(id || null);
  const teacher = data?.data;

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
                : "Failed to load teacher"}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/teachers")}
            >
              Back to Teachers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-secondary-600">Teacher not found</p>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/teachers")}
              className="mt-4"
            >
              Back to Teachers
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
            {teacher.fullName}
          </h1>
          <p className="text-gray-500 mt-1">Teacher Details</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/teachers")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          {(!teacher.username || !teacher.email) && (
            <p className="text-sm text-amber-600 mt-2">
              Some required information is missing. Please update the teacher
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
                  {teacher.username || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">
                  {teacher.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <School className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="text-base text-gray-900">
                  {teacher.school || "-"}
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
                  {teacher.createdAt
                    ? format(new Date(teacher.createdAt), "MMM dd, yyyy")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge
                  variant={teacher.isActive ? "success" : "danger"}
                  className="mt-1"
                >
                  {teacher.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                {teacher.role || "-"}
              </Badge>
            </div>

            {teacher.creator && (
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="text-base text-gray-900 mt-1">
                  {teacher.creator.fullName} ({teacher.creator.username})
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-base text-gray-900 mt-1">
                {teacher.createdAt
                  ? format(
                      new Date(teacher.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-base text-gray-900 mt-1">
                {teacher.updatedAt
                  ? format(
                      new Date(teacher.updatedAt),
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
            navigate("/admin/teachers");
          }}
        >
          Back to List
        </Button>
        <Button
          onClick={() => {
            // Navigate to edit - you might want to implement edit functionality
            navigate(`/admin/teachers?edit=${teacher.id}`);
          }}
        >
          Edit Teacher
        </Button>
      </div>
    </div>
  );
}
