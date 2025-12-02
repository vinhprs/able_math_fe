import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  useAssignments,
  useDeleteAssignment,
  type AssignmentFilters,
} from "@/hooks/useAssignments";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      {startPage > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Test
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-secondary-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "GRADED", label: "Graded" },
];

export function AssignmentList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AssignmentFilters>({
    page: 1,
    limit: 10,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null
  );

  const { data: assignmentsData, isLoading } = useAssignments(filters);
  const deleteMutation = useDeleteAssignment();

  const handleFilterChange = (key: keyof AssignmentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDelete = (id: string) => {
    setSelectedAssignment(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAssignment) {
      deleteMutation.mutate(selectedAssignment, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSelectedAssignment(null);
        },
      });
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Test Assignments
          </h1>
          <p className="text-secondary-500">
            Manage test assignments to students
          </p>
        </div>
        <Button onClick={() => navigate("/teacher/assignments/assign")}>
          <Plus className="w-4 h-4 mr-2" />
          Assign New Test
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-end gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => setFilters({ page: 1, limit: 10 })}
            disabled={!filters.status}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Assignments Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : assignmentsData && assignmentsData.data.length > 0 ? (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {assignmentsData.data.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-secondary-50">
                      {/* Student */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-secondary-400" />
                          <div>
                            <p className="font-medium text-secondary-900">
                              {assignment.student.fullName}
                            </p>
                            {assignment.student.grade && (
                              <p className="text-sm text-secondary-500">
                                {assignment.student.grade}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Test */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-secondary-900">
                            {assignment.test.title}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {assignment.test.testCode}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(assignment.status)}
                      </td>

                      {/* Assigned Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {formatDate(assignment.createdAt)}
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignment.deadline ? (
                          <span
                            className={`text-sm ${
                              new Date(assignment.deadline) < new Date() &&
                              assignment.status !== "GRADED"
                                ? "text-red-600 font-medium"
                                : "text-secondary-600"
                            }`}
                          >
                            {formatDateTime(assignment.deadline)}
                          </span>
                        ) : (
                          <span className="text-sm text-secondary-400">
                            No deadline
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/teacher/assignments/${assignment.id}`)
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {assignment.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {assignmentsData && assignmentsData.totalPages > 1 && (
            <Pagination
              currentPage={filters.page || 1}
              totalPages={assignmentsData.totalPages}
              onPageChange={(page) => handleFilterChange("page", page)}
            />
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-secondary-500">
            No assignments found. Try adjusting your filters.
          </p>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <Modal isOpen onClose={() => setDeleteModalOpen(false)}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Delete Assignment</h2>
            <p className="text-secondary-600">
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                variant="danger"
                className="flex-1"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
