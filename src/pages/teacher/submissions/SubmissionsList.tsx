import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Submission {
  id: string;
  student: {
    id: string;
    name: string;
    grade: string;
  };
  test: {
    id: string;
    testCode: string;
    title: string;
    testType: "ACHIEVEMENT" | "ADTM";
  };
  status: "PENDING" | "IN_PROGRESS" | "GRADED";
  submittedAt: string;
  gradedAt?: string;
  totalScore?: number;
  standardScore?: number;
}

export function TeacherSubmissionsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [testTypeFilter, setTestTypeFilter] = useState<string>("ALL");

  // Fetch submissions
  const {
    data: submissions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-submissions", statusFilter, testTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (testTypeFilter !== "ALL") params.append("testType", testTypeFilter);

      const response = await api.get<{
        success: boolean;
        data: Submission[];
        timestamp: string;
      }>(`/teacher/submissions?${params.toString()}`);
      return response.data.data;
    },
  });

  // Filter by search
  const filteredSubmissions =
    submissions?.filter(
      (sub) =>
        sub.student.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.test.testCode.toLowerCase().includes(search.toLowerCase()) ||
        sub.test.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const getStatusBadge = (status: string) => {
    if (status === "GRADED") {
      return (
        <Badge variant="success" className="flex items-center gap-1 w-fit">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <Badge variant="warning" className="flex items-center gap-1 w-fit">
          <Edit className="w-3 h-3" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="info" className="flex items-center gap-1 w-fit">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
  };

  const handleViewReport = (submission: Submission) => {
    if (submission.test.testType === "ADTM") {
      navigate(`/reports/adtm/${submission.id}`);
    } else {
      // Use ResultReview for Achievement tests
      navigate(`/teacher/results/${submission.id}`);
    }
  };

  const handleContinueGrading = (submission: Submission) => {
    if (submission.test.testType === "ADTM") {
      navigate(`/teacher/adtm/grade/${submission.id}`);
    } else {
      // Achievement tests are auto-graded, just view report
      navigate(`/teacher/results/${submission.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="danger">
          Failed to load submissions. Please try again.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Student Submissions
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage all student test submissions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by student name, test code, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "ALL", label: "All Status" },
            { value: "PENDING", label: "Pending" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "GRADED", label: "Completed" },
          ]}
          className="w-full sm:w-48"
        />

        {/* Test Type Filter */}
        <Select
          value={testTypeFilter}
          onChange={(e) => setTestTypeFilter(e.target.value)}
          options={[
            { value: "ALL", label: "All Types" },
            { value: "ACHIEVEMENT", label: "Achievement" },
            { value: "ADTM", label: "A-DTM" },
          ]}
          className="w-full sm:w-48"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold">{submissions?.length || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold">
                {submissions?.filter((s) => s.status !== "GRADED").length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">
                {submissions?.filter((s) => s.status === "GRADED").length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {submission.student.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {submission.student.grade}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {submission.test.testCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          {submission.test.title}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          submission.test.testType === "ADTM"
                            ? "default"
                            : "info"
                        }
                      >
                        {submission.test.testType}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.status === "GRADED" ? (
                        <div>
                          <p className="font-medium">
                            {submission.standardScore?.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.totalScore} pts
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {submission.status === "GRADED" ? (
                        <Button
                          size="sm"
                          onClick={() => handleViewReport(submission)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Report
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContinueGrading(submission)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          {submission.status === "IN_PROGRESS"
                            ? "Continue"
                            : "Start"}{" "}
                          Grading
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
