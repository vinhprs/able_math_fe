import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { useBulkAssign } from "@/hooks/useAssignments";
import { useStudents } from "@/hooks/useStudents";
import { useTeacherTestDetails } from "@/hooks/useTeacherTests";
import { formatDateTime } from "@/lib/utils";
import type { ITestDetail } from "@/types/test.types";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  FileText,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface AssignmentData {
  testId: string;
  studentIds: string[];
  deadline?: string;
}

// Step 1: Select Test
interface Step1SelectTestProps {
  selectedTestId: string;
  onSelect: (testId: string) => void;
}

function Step1SelectTest({ selectedTestId, onSelect }: Step1SelectTestProps) {
  const navigate = useNavigate();

  // For now, we'll redirect to browse tests page
  // In a real implementation, you'd fetch tests here
  const handleBrowseTests = () => {
    navigate("/teacher/tests/browse");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Select Test</h2>
        <p className="text-secondary-500">Choose a published test to assign</p>
      </div>

      {!selectedTestId ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
          <p className="text-secondary-600 mb-4">
            No test selected. Browse available tests to select one.
          </p>
          <Button onClick={handleBrowseTests}>
            <Search className="w-4 h-4 mr-2" />
            Browse Tests
          </Button>
        </Card>
      ) : (
        <Card className="p-6 bg-primary-50 border-2 border-primary-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium mb-1">
                Test Selected
              </p>
              <p className="text-secondary-900">Test ID: {selectedTestId}</p>
            </div>
            <Check className="w-6 h-6 text-primary-600" />
          </div>
        </Card>
      )}
    </div>
  );
}

// Step 2: Select Students
interface Step2SelectStudentsProps {
  students: Array<{ id: string; fullName: string; grade?: string }>;
  selectedIds: string[];
  onToggle: (studentId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

function Step2SelectStudents({
  students,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: Step2SelectStudentsProps) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.grade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Select Students</h2>
          <p className="text-secondary-500">
            {selectedIds.length} of {students.length} students selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onSelectAll}>
            Select All
          </Button>
          <Button size="sm" variant="outline" onClick={onDeselectAll}>
            Clear
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <Input
          placeholder="Search students..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary-50 cursor-pointer transition-colors"
            onClick={() => onToggle(student.id)}
          >
            <Checkbox
              checked={selectedIds.includes(student.id)}
              onChange={() => onToggle(student.id)}
            />
            <Users className="w-5 h-5 text-secondary-400" />
            <div className="flex-1">
              <p className="font-medium text-secondary-900">
                {student.fullName}
              </p>
              {student.grade && (
                <p className="text-sm text-secondary-500">{student.grade}</p>
              )}
            </div>
            {selectedIds.includes(student.id) && (
              <Check className="w-5 h-5 text-primary-600" />
            )}
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-secondary-500">
              No students found matching your search.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// Step 3: Set Deadline
interface Step3SetDeadlineProps {
  deadline?: string;
  onChange: (deadline?: string) => void;
}

function Step3SetDeadline({ deadline, onChange }: Step3SetDeadlineProps) {
  const [useDeadline, setUseDeadline] = useState(!!deadline);

  // Get tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const minDateTime = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Set Deadline</h2>
        <p className="text-secondary-500">
          Optional: Set a deadline for this assignment
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          checked={useDeadline}
          onChange={(e) => {
            setUseDeadline(e.target.checked);
            if (!e.target.checked) onChange(undefined);
          }}
        />
        <label className="font-medium text-secondary-900">
          Set a deadline for this test
        </label>
      </div>

      {useDeadline && (
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Deadline Date & Time
          </label>
          <Input
            type="datetime-local"
            min={minDateTime}
            value={deadline || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="text-sm text-secondary-500 mt-2">
            Students must complete the test before this date and time
          </p>
        </div>
      )}

      {!useDeadline && (
        <Card className="p-6 bg-primary-50 border-primary-200">
          <p className="text-primary-800">
            <FileText className="w-5 h-5 inline mr-2" />
            No deadline will be set. Students can complete this test at any
            time.
          </p>
        </Card>
      )}
    </div>
  );
}

// Step 4: Review
interface Step4ReviewProps {
  test: ITestDetail | null;
  students: Array<{ id: string; fullName: string; grade?: string }>;
  deadline?: string;
}

function Step4Review({ test, students, deadline }: Step4ReviewProps) {
  if (!test) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-600 mb-4" />
        <p className="text-secondary-500">Loading test details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Review & Confirm</h2>
        <p className="text-secondary-500">
          Please review the assignment details before confirming
        </p>
      </div>

      {/* Test Info */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Test Information
        </h3>
        <Card className="p-4 bg-secondary-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary-600">Title:</span>
              <span className="font-medium">{test.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Code:</span>
              <span className="font-medium">{test.testCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Questions:</span>
              <span className="font-medium">{test.questions?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Total Score:</span>
              <span className="font-medium">{test.totalScore}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Students */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Students ({students.length})
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-2 p-2 bg-secondary-50 rounded"
            >
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-secondary-900">{student.fullName}</span>
              {student.grade && (
                <span className="text-sm text-secondary-500">
                  ({student.grade})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Deadline
        </h3>
        <Card className="p-4 bg-secondary-50">
          {deadline ? (
            <p className="font-medium">{formatDateTime(deadline)}</p>
          ) : (
            <p className="text-secondary-600">No deadline set</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export function AssignTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    testId: searchParams.get("testId") || "",
    studentIds: [],
    deadline: undefined,
  });

  // Fetch test details
  const { data: test, isLoading: isLoadingTest } = useTeacherTestDetails(
    assignmentData.testId || null
  );

  // Fetch students
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();

  // Bulk assign mutation
  const assignMutation = useBulkAssign();

  const handleNext = () => {
    if (currentStep === 1 && !assignmentData.testId) {
      alert("Please select a test");
      return;
    }
    if (currentStep === 2 && assignmentData.studentIds.length === 0) {
      alert("Please select at least one student");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    assignMutation.mutate(
      {
        testId: assignmentData.testId,
        studentIds: assignmentData.studentIds,
        deadline: assignmentData.deadline,
      },
      {
        onSuccess: () => {
          navigate("/teacher/assignments");
        },
      }
    );
  };

  const toggleStudent = (studentId: string) => {
    setAssignmentData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  const selectAllStudents = () => {
    setAssignmentData((prev) => ({
      ...prev,
      studentIds: students.map((s) => s.id),
    }));
  };

  const deselectAllStudents = () => {
    setAssignmentData((prev) => ({
      ...prev,
      studentIds: [],
    }));
  };

  const selectedStudents = students.filter((s) =>
    assignmentData.studentIds.includes(s.id)
  );

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
          <h1 className="text-3xl font-bold text-secondary-900">Assign Test</h1>
          <p className="text-secondary-500">Assign a test to your students</p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step, index) => (
            <>
              <div
                key={step}
                className={`flex items-center gap-3 ${
                  currentStep >= step
                    ? "text-primary-600"
                    : "text-secondary-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? "bg-primary-600 text-white"
                      : "bg-secondary-200 text-secondary-500"
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                <span className="font-medium hidden md:block">
                  {step === 1 && "Select Test"}
                  {step === 2 && "Select Students"}
                  {step === 3 && "Set Deadline"}
                  {step === 4 && "Review"}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step ? "bg-primary-600" : "bg-secondary-200"
                  }`}
                />
              )}
            </>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 1 && (
          <Step1SelectTest
            selectedTestId={assignmentData.testId}
            onSelect={(testId) =>
              setAssignmentData((prev) => ({ ...prev, testId }))
            }
          />
        )}

        {currentStep === 2 && (
          <Step2SelectStudents
            students={students}
            selectedIds={assignmentData.studentIds}
            onToggle={toggleStudent}
            onSelectAll={selectAllStudents}
            onDeselectAll={deselectAllStudents}
          />
        )}

        {currentStep === 3 && (
          <Step3SetDeadline
            deadline={assignmentData.deadline}
            onChange={(deadline) =>
              setAssignmentData((prev) => ({ ...prev, deadline }))
            }
          />
        )}

        {currentStep === 4 && (
          <Step4Review
            test={test || null}
            students={selectedStudents}
            deadline={assignmentData.deadline}
          />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={assignMutation.isPending}
            isLoading={assignMutation.isPending}
          >
            {assignMutation.isPending ? "Assigning..." : "Confirm & Assign"}
          </Button>
        )}
      </div>
    </div>
  );
}
