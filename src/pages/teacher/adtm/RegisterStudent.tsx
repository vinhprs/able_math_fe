import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { useRegisterStudent } from "@/hooks/useAdtmGradingWorkflow";
import { ArrowLeft } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

interface Student {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

interface Test {
  id: string;
  testCode: string;
  title: string;
  grade: string;
}

export function RegisterStudent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get("studentId");

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudentId || ""
  );
  const [selectedTestCode, setSelectedTestCode] = useState<string>("");

  const registerMutation = useRegisterStudent();

  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Student[];
        timestamp: string;
      }>("/users", {
        params: { role: "STUDENT" },
      });
      return response.data.data;
    },
  });

  // Fetch A-DTM tests
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ["adtm-tests"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Test[];
        timestamp: string;
      }>("/tests", {
        params: { testType: "ADTM", status: "PUBLISHED" },
      });
      return response.data.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedTestCode) {
      toastError("Please select both student and test");
      return;
    }

    try {
      const submission = await registerMutation.mutateAsync({
        studentId: selectedStudentId,
        testCode: selectedTestCode,
      });

      toastSuccess("Student registered successfully");
      navigate(`/teacher/adtm/grade/${submission.id}`);
    } catch (error: any) {
      toastError(error.message || "Failed to register student");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/teacher/adtm/students")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Students
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Register Student for A-DTM Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={studentsLoading}
                required
                className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Choose a student...</option>
                {students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select A-DTM Test
              </label>
              <select
                value={selectedTestCode}
                onChange={(e) => setSelectedTestCode(e.target.value)}
                disabled={testsLoading}
                required
                className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Choose a test...</option>
                {tests?.map((test) => (
                  <option key={test.id} value={test.testCode}>
                    {test.testCode} - {test.title} ({test.grade})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/teacher/adtm/students")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedStudentId ||
                  !selectedTestCode ||
                  registerMutation.isPending
                }
                isLoading={registerMutation.isPending}
              >
                Register & Start Grading
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
