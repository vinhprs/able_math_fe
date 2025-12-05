import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTests, useDeleteTest, usePublishTest } from "@/hooks/useTests";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Badge,
} from "@/components/ui";
import { TestStatus, TestType } from "@/shared/types/enum";
import { Search, Plus, Eye, Edit, Trash2, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: TestStatus.DRAFT, label: "Draft" },
  { value: TestStatus.PUBLISHED, label: "Published" },
  { value: TestStatus.ARCHIVED, label: "Archived" },
];

const GRADE_OPTIONS = [
  { value: "", label: "All Grades" },
  { value: "E1", label: "E1" },
  { value: "E2", label: "E2" },
  { value: "E3", label: "E3" },
  { value: "E4", label: "E4" },
  { value: "E5", label: "E5" },
  { value: "E6", label: "E6" },
  { value: "M1", label: "M1" },
  { value: "M2", label: "M2" },
  { value: "M3", label: "M3" },
];

const CURRICULUM_OPTIONS = [
  { value: "", label: "All Curricula" },
  { value: "Singapore Math", label: "Singapore Math" },
  { value: "Common Core", label: "Common Core" },
  { value: "Vietnamese", label: "Vietnamese" },
];

export function TestList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    testType: TestType.ACHIEVEMENT,
    grade: "",
    status: "",
    curriculum: "",
    search: "",
  });

  const { data, isLoading, error } = useTests({
    page: filters.page,
    limit: filters.limit,
    testType: filters.testType,
    grade: filters.grade,
    status: filters.status as TestStatus,
    curriculum: filters.curriculum,
    search: filters.search,
  });
  const deleteTest = useDeleteTest();
  const publishTest = usePublishTest();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleDelete = async (id: string, testCode: string) => {
    if (window.confirm(`Are you sure you want to archive test ${testCode}?`)) {
      try {
        await deleteTest.mutateAsync(id);
        alert("Test archived successfully");
      } catch (error: any) {
        alert(error.message || "Failed to archive test");
      }
    }
  };

  const handlePublish = async (id: string) => {
    if (window.confirm("Are you sure you want to publish this test?")) {
      try {
        await publishTest.mutateAsync(id);
        alert("Test published successfully");
      } catch (error: any) {
        alert(error.message || "Failed to publish test");
      }
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const variants: Record<
      TestStatus,
      "default" | "success" | "warning" | "danger"
    > = {
      [TestStatus.DRAFT]: "default",
      [TestStatus.PUBLISHED]: "success",
      [TestStatus.ARCHIVED]: "danger",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Achievement Tests</CardTitle>
              <p className="text-sm text-secondary-500 mt-1">
                Manage and view all achievement tests
              </p>
            </div>
            <Button onClick={() => navigate("/admin/tests/achievement/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <Input
                placeholder="Search by title or code..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={GRADE_OPTIONS}
              value={filters.grade}
              onChange={(e) => handleFilterChange("grade", e.target.value)}
            />
            <Select
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            />
            <Select
              options={CURRICULUM_OPTIONS}
              value={filters.curriculum}
              onChange={(e) => handleFilterChange("curriculum", e.target.value)}
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Error loading tests. Please try again.
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12 text-secondary-500">
              No tests found. Create your first test to get started.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                        Code
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                        Level
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((test) => (
                      <tr
                        key={test.id}
                        className="border-b border-secondary-100 hover:bg-secondary-50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium">
                            {test.testCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-secondary-900">
                            {test.title}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-secondary-700">
                            {test.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-secondary-700">
                            L{test.level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(test.status)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-secondary-500">
                            {format(new Date(test.createdAt), "MMM d, yyyy")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/admin/tests/achievement/${test.id}`)
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {test.status === TestStatus.DRAFT && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    navigate(
                                      `/admin/tests/achievement/${test.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePublish(test.id)}
                                  disabled={publishTest.isPending}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(test.id, test.testCode)
                              }
                              disabled={deleteTest.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-secondary-600">
                    Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                    {Math.min(filters.page * filters.limit, data.total)} of{" "}
                    {data.total} tests
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={filters.page >= data.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
