import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classService } from "@/services/classService";
import { assignmentService } from "@/services/assignmentService";
import type { IClass, IClassStatistics } from "@/types/class";
import type { IAssignment, AssignmentStatus } from "@/types/assignment";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  UserPlus,
  UserMinus,
  BarChart3,
  BookOpen,
  Plus,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useStudents } from "@/hooks/useStudents";
import { Search } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/toast";
import { formatDate, formatDateTime } from "@/lib/utils";

type TabType = "students" | "assignments" | "statistics";

export default function ClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<IClass | null>(null);
  const [statistics, setStatistics] = useState<IClassStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("students");
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Assignments state
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (id) {
      loadClassData();
      loadStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "assignments") {
      loadAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const data = await classService.getById(id!);
      setClassData(data);
    } catch (error: any) {
      console.error("Failed to load class:", error);
      toastError(error?.message || "Failed to load class");
      navigate("/teacher/classes");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await classService.getStatistics(id!);
      setStatistics(stats);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
      toastError(error?.message || "Failed to load statistics");
    }
  };

  const loadAssignments = async () => {
    if (!id) return;
    try {
      setAssignmentsLoading(true);
      const response = await assignmentService.getTeacherAssignments({
        classId: id,
        limit: 100,
      });
      setAssignments(response.data);
    } catch (error: any) {
      console.error("Failed to load assignments:", error);
      toastError(error?.message || "Failed to load assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteAssignmentId) return;

    try {
      await assignmentService.delete(deleteAssignmentId);
      toastSuccess("Assignment deleted successfully");
      setDeleteAssignmentId(null);
      loadAssignments();
    } catch (error: any) {
      console.error("Failed to delete assignment:", error);
      toastError(error?.message || "Failed to delete assignment");
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    const variants: Record<
      AssignmentStatus,
      {
        variant: "default" | "success" | "warning" | "danger" | "info";
        className: string;
      }
    > = {
      PENDING: { variant: "info", className: "bg-gray-100 text-gray-800" },
      IN_PROGRESS: {
        variant: "warning",
        className: "bg-blue-100 text-blue-800",
      },
      SUBMITTED: {
        variant: "default",
        className: "bg-green-100 text-green-800",
      },
      GRADED: {
        variant: "success",
        className: "bg-purple-100 text-purple-800",
      },
    };
    const config = variants[status] || variants.PENDING;

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const handleDeleteClass = async () => {
    if (!classData) return;

    if (
      !confirm(
        `Delete class "${classData.name}"? This action cannot be undone.`
      )
    )
      return;

    try {
      await classService.delete(classData.id);
      toastSuccess("Class deleted successfully");
      navigate("/teacher/classes");
    } catch (error: any) {
      console.error("Failed to delete class:", error);
      toastError(error?.message || "Failed to delete class");
    }
  };

  const handleRemoveStudent = async (
    studentId: string,
    studentName: string
  ) => {
    if (!confirm(`Remove ${studentName} from this class?`)) return;

    try {
      await classService.removeStudent(id!, studentId);
      toastSuccess("Student removed successfully");
      loadClassData();
      loadStatistics();
    } catch (error: any) {
      console.error("Failed to remove student:", error);
      toastError(error?.message || "Failed to remove student");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">Class not found</p>
        <Button
          variant="outline"
          onClick={() => navigate("/teacher/classes")}
          className="mt-4"
        >
          Back to Classes
        </Button>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/teacher/classes")}
            className="p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {classData.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {classData.grade} {classData.term && `• ${classData.term}`}
              {classData.schoolYear && ` • ${classData.schoolYear}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/teacher/classes/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteClass}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {classData.studentCount || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {statistics?.activeStudents || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {classData.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                classData.isActive ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <BarChart3
                className={`w-8 h-8 ${
                  classData.isActive ? "text-green-600" : "text-gray-600"
                }`}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      {classData.description && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{classData.description}</p>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab("students")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "students"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Students ({classData.studentCount || 0})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "assignments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Assignments ({assignments.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "statistics"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistics
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {activeTab === "students" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Class Students
                </h3>
                <Button
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Students
                </Button>
              </div>

              {!classData.students || classData.students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No students yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add students to this class to get started
                  </p>
                  <Button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add Students
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classData.students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{student.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.grade || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {student.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveStudent(
                                  student.id,
                                  student.fullName
                                )
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              <UserMinus className="w-5 h-5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Test Assignments
                </h3>
                <Button
                  onClick={() => navigate(`/teacher/assign-test?classId=${id}`)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Assign Test
                </Button>
              </div>

              {assignmentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No assignments yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Assign tests to this class to get started
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/teacher/assign-test?classId=${id}`)
                    }
                    className="inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Assign Test
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          {/* Test */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {assignment.test?.title || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {assignment.test?.testCode || "N/A"}
                              </p>
                            </div>
                          </td>

                          {/* Student */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {assignment.student?.fullName || "N/A"}
                            </div>
                            {assignment.student?.grade && (
                              <div className="text-sm text-gray-500">
                                {assignment.student.grade}
                              </div>
                            )}
                          </td>

                          {/* Deadline */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {assignment.deadline ? (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDateTime(assignment.deadline)}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No deadline
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(assignment.status)}
                          </td>

                          {/* Assigned Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(assignment.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/teacher/assignments/${assignment.id}`
                                  )
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {assignment.status === "PENDING" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeleteAssignmentId(assignment.id)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "statistics" && statistics && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Class Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statistics.totalStudents}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 text-sm">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statistics.activeStudents}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-6">
                More statistics will be available after students complete tests
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Add Students"
        size="lg"
      >
        <AddStudentForm
          classId={id!}
          existingStudentIds={classData.students?.map((s) => s.id) || []}
          onClose={() => setShowAddStudentModal(false)}
          onSuccess={() => {
            setShowAddStudentModal(false);
            loadClassData();
            loadStatistics();
          }}
        />
      </Modal>

      {/* Delete Assignment Modal */}
      <Modal
        isOpen={!!deleteAssignmentId}
        onClose={() => setDeleteAssignmentId(null)}
        title="Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this assignment? This action cannot
            be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteAssignmentId(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAssignment}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Add Student Form Component
function AddStudentForm({
  classId,
  existingStudentIds,
  onClose,
  onSuccess,
}: {
  classId: string;
  existingStudentIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: students = [], isLoading: studentsLoading } = useStudents(
    search,
    100
  );

  // Filter out students already in the class
  const availableStudents = students.filter(
    (student) => !existingStudentIds.includes(student.id)
  );

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === availableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableStudents.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentIds.length === 0) {
      toastError("Please select at least one student");
      return;
    }

    try {
      setLoading(true);
      await classService.addStudents(classId, selectedStudentIds);
      toastSuccess(
        `Successfully added ${selectedStudentIds.length} student(s)`
      );
      onSuccess();
    } catch (error: any) {
      console.error("Failed to add students:", error);
      toastError(error?.message || "Failed to add students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {studentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : availableStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {search
                ? "No students found matching your search"
                : existingStudentIds.length > 0
                ? "All students are already in this class"
                : "No students available"}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2">
              <Checkbox
                checked={
                  availableStudents.length > 0 &&
                  selectedStudentIds.length === availableStudents.length
                }
                onChange={handleSelectAll}
                label={`Select All (${availableStudents.length} available)`}
              />
            </div>

            {/* Student List */}
            <div className="divide-y divide-gray-200">
              {availableStudents.map((student) => (
                <div
                  key={student.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                      id={`student-${student.id}`}
                    />
                    <label
                      htmlFor={`student-${student.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.email}
                          </p>
                          {student.grade && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Grade: {student.grade}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Selected Count */}
      {selectedStudentIds.length > 0 && (
        <p className="text-sm text-gray-600">
          {selectedStudentIds.length} student(s) selected
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || selectedStudentIds.length === 0}
          isLoading={loading}
          className="flex-1"
        >
          Add{" "}
          {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ` : ""}
          Student
          {selectedStudentIds.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </form>
  );
}
