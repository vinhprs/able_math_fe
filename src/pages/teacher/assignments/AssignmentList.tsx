import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { assignmentService } from "@/services/assignmentService";
import { classService } from "@/services/classService";
import { toastSuccess, toastError } from "@/lib/toast";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { IAssignment, AssignmentStatus, IAssignmentQueryParams } from "@/types/assignment";
import type { IClass } from "@/types/class";
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Plus,
  Trash2,
  User,
  Users,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [classes, setClasses] = useState<IClass[]>([]);

  // Load classes for filter
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classService.getAll({ limit: 100, isActive: true });
        setClasses(response.data);
      } catch (error) {
        console.error('Failed to load classes:', error);
      }
    };
    loadClasses();
  }, []);

  // Load assignments
  useEffect(() => {
    loadAssignments();
  }, [currentPage, statusFilter, classFilter]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params: IAssignmentQueryParams = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        classId: classFilter || undefined,
      };
      const response = await assignmentService.getTeacherAssignments(params);
      setAssignments(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toastError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: 'status' | 'class', value: string) => {
    if (key === 'status') {
      setStatusFilter(value as AssignmentStatus | '');
    } else if (key === 'class') {
      setClassFilter(value);
    }
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setSelectedAssignment(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAssignment) return;

    try {
      setDeleting(true);
      await assignmentService.delete(selectedAssignment);
      toastSuccess('Assignment deleted successfully');
      setDeleteModalOpen(false);
      setSelectedAssignment(null);
      loadAssignments();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      toastError(error?.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeleting(false);
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
        <Button onClick={() => navigate("/teacher/assign-test")}>
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
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Class Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Class</label>
            <Select
              value={classFilter}
              onChange={(e) => handleFilterChange("class", e.target.value)}
              options={[
                { value: "", label: "All Classes" },
                ...classes.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
            />
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("");
              setClassFilter("");
              setCurrentPage(1);
            }}
            disabled={!statusFilter && !classFilter}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Assignments Table */}
      {loading ? (
        <TableSkeleton />
      ) : assignments.length > 0 ? (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Student/Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-secondary-50">
                      {/* Test */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-secondary-900">
                            {assignment.test?.title || 'N/A'}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {assignment.test?.testCode || 'N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Student/Class */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-secondary-400" />
                          <div>
                            <p className="font-medium text-secondary-900">
                              {assignment.student?.fullName || 'N/A'}
                            </p>
                            {assignment.class && (
                              <div className="text-sm text-secondary-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {assignment.class.name}
                              </div>
                            )}
                            {assignment.student?.grade && !assignment.class && (
                              <p className="text-sm text-secondary-500">
                                {assignment.student.grade}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignment.deadline ? (
                          <span
                            className={`text-sm flex items-center gap-1 ${
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

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(assignment.status)}
                      </td>

                      {/* Assigned Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {formatDate(assignment.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
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
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No assignments yet
          </h3>
          <p className="text-secondary-500 mb-4">
            Create your first test assignment
          </p>
          <Button onClick={() => navigate("/teacher/assign-test")}>
            <Plus className="w-4 h-4 mr-2" />
            Assign Test
          </Button>
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
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                variant="danger"
                className="flex-1"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
