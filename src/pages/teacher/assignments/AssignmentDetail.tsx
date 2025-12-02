import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAssignment, useExtendDeadline } from "@/hooks/useAssignments";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [extendDeadlineModalOpen, setExtendDeadlineModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");

  const { data: assignment, isLoading } = useAssignment(id || null);
  const extendDeadlineMutation = useExtendDeadline();

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "success" | "warning" | "danger" | "info";
        icon: typeof Clock;
      }
    > = {
      PENDING: { variant: "info", icon: Clock },
      IN_PROGRESS: { variant: "warning", icon: FileText },
      SUBMITTED: { variant: "default", icon: CheckCircle },
      GRADED: { variant: "success", icon: CheckCircle },
    };
    const config = variants[status] || { variant: "default", icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleExtendDeadline = () => {
    if (!assignment || !newDeadline) return;

    const deadlineDate = new Date(newDeadline);
    extendDeadlineMutation.mutate(
      { id: assignment.id, newDeadline: deadlineDate },
      {
        onSuccess: () => {
          setExtendDeadlineModalOpen(false);
          setNewDeadline("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="p-12 text-center">
        <p className="text-secondary-500">Assignment not found</p>
        <Button
          variant="outline"
          onClick={() => navigate("/teacher/assignments")}
          className="mt-4"
        >
          Back to Assignments
        </Button>
      </Card>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/teacher/assignments")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Assignment Details
          </h1>
          <p className="text-secondary-500">View assignment information</p>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-secondary-900">
              Test Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-500">Title</p>
              <p className="font-medium text-secondary-900">
                {assignment.test.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Test Code</p>
              <p className="font-medium text-secondary-900">
                {assignment.test.testCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Total Score</p>
              <p className="font-medium text-secondary-900">
                {assignment.test.totalScore} points
              </p>
            </div>
            {assignment.test.questionCount !== undefined && (
              <div>
                <p className="text-sm text-secondary-500">Questions</p>
                <p className="font-medium text-secondary-900">
                  {assignment.test.questionCount} questions
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Student Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-secondary-900">
              Student Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-500">Name</p>
              <p className="font-medium text-secondary-900">
                {assignment.student.fullName}
              </p>
            </div>
            {assignment.student.email && (
              <div>
                <p className="text-sm text-secondary-500">Email</p>
                <p className="font-medium text-secondary-900">
                  {assignment.student.email}
                </p>
              </div>
            )}
            {assignment.student.grade && (
              <div>
                <p className="text-sm text-secondary-500">Grade</p>
                <p className="font-medium text-secondary-900">
                  {assignment.student.grade}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Assignment Status & Details */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-secondary-900">
            Assignment Status
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-secondary-500 mb-2">Status</p>
            {getStatusBadge(assignment.status)}
          </div>
          <div>
            <p className="text-sm text-secondary-500 mb-2">Assigned On</p>
            <p className="font-medium text-secondary-900">
              {formatDate(assignment.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary-500 mb-2">Deadline</p>
            {assignment.deadline ? (
              <div>
                <p
                  className={`font-medium ${
                    new Date(assignment.deadline) < new Date() &&
                    assignment.status !== "GRADED"
                      ? "text-red-600"
                      : "text-secondary-900"
                  }`}
                >
                  {formatDateTime(assignment.deadline)}
                </p>
                {assignment.status !== "GRADED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExtendDeadlineModalOpen(true)}
                    className="mt-2"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Extend Deadline
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-secondary-500">No deadline set</p>
            )}
          </div>
          {assignment.assignedBy && (
            <div>
              <p className="text-sm text-secondary-500 mb-2">Assigned By</p>
              <p className="font-medium text-secondary-900">
                {assignment.assignedBy.fullName}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Extend Deadline Modal */}
      {extendDeadlineModalOpen && (
        <Modal
          isOpen
          onClose={() => {
            setExtendDeadlineModalOpen(false);
            setNewDeadline("");
          }}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Extend Deadline</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                New Deadline Date & Time
              </label>
              <Input
                type="datetime-local"
                min={minDateTime}
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
              <p className="text-sm text-secondary-500 mt-2">
                Select a new deadline that is in the future
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setExtendDeadlineModalOpen(false);
                  setNewDeadline("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExtendDeadline}
                disabled={!newDeadline || extendDeadlineMutation.isPending}
                isLoading={extendDeadlineMutation.isPending}
                className="flex-1"
              >
                {extendDeadlineMutation.isPending
                  ? "Updating..."
                  : "Extend Deadline"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
