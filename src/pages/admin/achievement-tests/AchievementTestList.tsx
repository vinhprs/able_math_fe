import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Spinner,
  Pagination,
} from "@/components/ui";
import { toastError } from "@/lib/toast";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import type { AchievementTest } from "@/shared/types/achievement-test.types";
import { format } from "date-fns";
import { Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const GRADE_OPTIONS = [
  { value: "", label: "All Grades" },
  { value: "E4", label: "E4" },
  { value: "E5", label: "E5" },
  { value: "E6", label: "E6" },
];

export function AchievementTestList() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<AchievementTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    grade: "",
    status: "",
  });

  useEffect(() => {
    fetchTests();
  }, [filters]);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const result = await achievementTestsApi.getTestList({
        page: filters.page,
        limit: filters.limit,
        grade: filters.grade || undefined,
        status: filters.status || undefined,
      });
      setTests(result.tests || []);

      // Calculate totalPages from total and limit
      const totalPages = result.total
        ? Math.ceil(result.total / result.limit)
        : 0;

      setPagination({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 20,
        totalPages,
      });
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to fetch tests");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "success" | "warning" | "danger" | "info"
    > = {
      PUBLISHED: "default",
      DRAFT: "success",
      ARCHIVED: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Achievement Tests</h1>
          <p className="text-gray-600 mt-1">
            Manage achievement test codes and answer keys
          </p>
        </div>
        <Button onClick={() => navigate("/admin/achievement-tests/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Grade"
              options={GRADE_OPTIONS}
              value={filters.grade}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  grade: e.target.value,
                  page: 1,
                }))
              }
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Test Code</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Level</th>
                    <th className="px-4 py-3 text-left">Questions</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold">
                        {test.testCode}
                      </td>
                      <td className="px-4 py-3">{test.grade}</td>
                      <td className="px-4 py-3">{test.level}</td>
                      <td className="px-4 py-3">{test.totalQuestions}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(test.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {format(new Date(test.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/achievement-tests/${test.id}`)
                          }
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && tests.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
