import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAvailableStudents,
  useAdtmTemplatesForAssignment,
  useAssignStudents,
} from "@/hooks/useAdtmAssignment";
import { useClasses } from "@/hooks/useClasses";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Badge,
  Checkbox,
  Stepper,
  Textarea,
  Modal,
} from "@/components/ui";
import {
  Search,
  Loader2,
  X,
  CheckCircle2,
  Users,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import type {
  AvailableStudent,
  AdtmTemplateForAssignment,
} from "@/types/adtm-assignment.types";

const STEPS = ["Select Students", "Choose Template", "Confirm & Assign"];

export function AssignStudentsPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<AdtmTemplateForAssignment | null>(null);
  const [testDate, setTestDate] = useState("");
  const [gradingDueDate, setGradingDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyStudents, setNotifyStudents] = useState(false);
  const [notifyParents, setNotifyParents] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  // Filters for step 1
  const [filters, setFilters] = useState({
    grade: "",
    classId: "",
    search: "",
    page: 1,
    limit: 50,
  });

  // Template filter
  const [templateLevel, setTemplateLevel] = useState<string>("");

  const { data: studentsData, isLoading: studentsLoading } =
    useAvailableStudents(filters);
  const { data: classesData } = useClasses({ page: 1, limit: 100 });
  const { data: templatesData, isLoading: templatesLoading } =
    useAdtmTemplatesForAssignment(templateLevel);
  const assignMutation = useAssignStudents();

  const selectedStudents = useMemo(() => {
    if (!studentsData) return [];
    return studentsData.students.filter((s) => selectedStudentIds.has(s.id));
  }, [studentsData, selectedStudentIds]);

  const canAssignStudent = (student: AvailableStudent) => {
    return !student.hasActiveAdtm;
  };

  const toggleStudent = (studentId: string) => {
    const student = studentsData?.students.find((s) => s.id === studentId);
    if (!student || !canAssignStudent(student)) return;

    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!studentsData) return;

    const availableStudents = studentsData.students.filter(canAssignStudent);
    const allSelected = availableStudents.every((s) =>
      selectedStudentIds.has(s.id)
    );

    if (allSelected) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(availableStudents.map((s) => s.id)));
    }
  };

  const isRecommendedTemplate = (template: AdtmTemplateForAssignment) => {
    if (selectedStudents.length === 0) return false;
    const studentGrades = selectedStudents.map((s) => s.grade);
    const mostCommonGrade = getMostCommon(studentGrades);
    return template.grade === mostCommonGrade;
  };

  const handleAssign = async () => {
    if (!selectedTemplate || selectedStudentIds.size === 0 || !testDate) return;

    try {
      const result = await assignMutation.mutateAsync({
        studentIds: Array.from(selectedStudentIds),
        templateId: selectedTemplate.id,
        testDate,
        gradingDueDate: gradingDueDate || undefined,
        notes: notes || undefined,
        notifyStudents,
        notifyParents,
      });

      setAssignedCount(result.assignedCount);
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.message || "Failed to assign students");
    }
  };

  const resetAll = () => {
    setCurrentStep(1);
    setSelectedStudentIds(new Set());
    setSelectedTemplate(null);
    setTestDate("");
    setGradingDueDate("");
    setNotes("");
    setNotifyStudents(false);
    setNotifyParents(false);
  };

  const gradeOptions = useMemo(() => {
    const grades = new Set(
      studentsData?.students.map((s) => s.grade).filter(Boolean) || []
    );
    return [
      { value: "", label: "All Grades" },
      ...Array.from(grades).map((g) => ({ value: g, label: g })),
    ];
  }, [studentsData]);

  const classOptions = useMemo(() => {
    return [
      { value: "", label: "All Classes" },
      ...(classesData?.data.map((c) => ({ value: c.id, label: c.name })) || []),
    ];
  }, [classesData]);

  const allSelected = useMemo(() => {
    if (!studentsData) return false;
    const availableStudents = studentsData.students.filter(canAssignStudent);
    return (
      availableStudents.length > 0 &&
      availableStudents.every((s) => selectedStudentIds.has(s.id))
    );
  }, [studentsData, selectedStudentIds]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          Assign Students to A-DTM Test
        </h1>
        <p className="text-secondary-500 mt-1">
          Select students and assign them to an A-DTM template
        </p>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step 1: Select Students */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Students</CardTitle>
                <p className="text-sm text-secondary-500 mt-1">
                  {selectedStudentIds.size} student(s) selected
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                  className="pl-10"
                />
              </div>
              <Select
                options={gradeOptions}
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
                options={classOptions}
                value={filters.classId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    classId: e.target.value,
                    page: 1,
                  }))
                }
              />
            </div>

            {/* Students Table */}
            {studentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : studentsData && studentsData.students.length > 0 ? (
              <div className="border border-secondary-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={allSelected}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                        Student ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                        Last A-DTM Test
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {studentsData.students.map((student) => {
                      const canAssign = canAssignStudent(student);
                      return (
                        <tr
                          key={student.id}
                          className={
                            !canAssign
                              ? "opacity-50 bg-secondary-50"
                              : "hover:bg-secondary-50"
                          }
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedStudentIds.has(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              disabled={!canAssign}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-secondary-600">
                            {student.studentId}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{student.grade}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{student.class}</td>
                          <td className="px-4 py-3 text-sm">
                            {student.lastAdtmTest ? (
                              <div>
                                <div className="font-medium">
                                  {student.lastAdtmTest.testCode}
                                </div>
                                <div className="text-secondary-500">
                                  {format(
                                    new Date(student.lastAdtmTest.date),
                                    "MMM d, yyyy"
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-secondary-400">
                                Never taken
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {student.hasActiveAdtm ? (
                              <Badge variant="warning">Active Test</Badge>
                            ) : (
                              <Badge variant="success">Available</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-secondary-500">
                No students found
              </div>
            )}

            {/* Pagination */}
            {studentsData && studentsData.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary-600">
                  Page {studentsData.page} of {studentsData.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={studentsData.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={studentsData.page >= studentsData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={selectedStudentIds.size === 0}
              >
                Next: Choose Template ({selectedStudentIds.size})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Template */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Choose A-DTM Template</CardTitle>
              <p className="text-sm text-secondary-500 mt-1">
                Assigning to {selectedStudentIds.size} student(s)
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Filters */}
            <div className="flex items-center gap-4">
              <Select
                options={[
                  { value: "", label: "All Levels" },
                  { value: "Elementary", label: "Elementary" },
                  { value: "Middle School", label: "Middle School" },
                  { value: "High School", label: "High School" },
                ]}
                value={templateLevel}
                onChange={(e) => setTemplateLevel(e.target.value)}
              />
            </div>

            {/* Templates Grid */}
            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : templatesData && templatesData.templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templatesData.templates.map((template) => {
                  const isRecommended = isRecommendedTemplate(template);
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "ring-2 ring-primary-600 border-primary-600"
                          : ""
                      } ${isRecommended ? "border-green-300" : ""}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {template.testCode}
                            </CardTitle>
                            {isRecommended && (
                              <Badge variant="success" className="mt-1">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <Badge variant="info">{template.grade}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium mb-2">{template.title}</p>
                        <div className="space-y-1 text-sm text-secondary-600 mb-3">
                          <div>Semester {template.semester}</div>
                          <div>{template.totalScore} points</div>
                          <div>{template.questionCount} questions</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="default" className="text-xs">
                            S1: {template.section1Count}Q
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            S2: {template.section2Count}Q
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            S3: {template.section3Count}Q
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            S4: 4Q
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            S5: 4Q
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary-500">
                No templates found
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!selectedTemplate}
              >
                Next: Confirm Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm & Assign */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">Students</p>
                  <p className="font-medium">
                    {selectedStudentIds.size} student(s)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                >
                  Change
                </Button>
              </div>
              <div className="h-px bg-secondary-200" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">Template</p>
                  <p className="font-medium">
                    {selectedTemplate?.testCode} - {selectedTemplate?.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                  Test Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <p className="mt-1.5 text-sm text-secondary-500">
                  The date when students will take this test
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                  Due Date for Grading (Optional)
                </label>
                <Input
                  type="date"
                  value={gradingDueDate}
                  onChange={(e) => setGradingDueDate(e.target.value)}
                  min={testDate || new Date().toISOString().split("T")[0]}
                />
                <p className="mt-1.5 text-sm text-secondary-500">
                  Deadline for you to complete grading
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                  Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this test assignment..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Notification Settings
                </label>
                <div className="space-y-2">
                  <Checkbox
                    checked={notifyStudents}
                    onChange={(e) => setNotifyStudents(e.target.checked)}
                    label="Send notification to students"
                  />
                  <Checkbox
                    checked={notifyParents}
                    onChange={(e) => setNotifyParents(e.target.checked)}
                    label="Send notification to parents"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Students Review */}
          <Card>
            <CardHeader>
              <CardTitle>
                Selected Students ({selectedStudentIds.size})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2 bg-secondary-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-secondary-500">
                          {student.studentId} • {student.grade} •{" "}
                          {student.class}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStudentIds((prev) => {
                          const next = new Set(prev);
                          next.delete(student.id);
                          return next;
                        });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={resetAll}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={
                  !selectedTemplate ||
                  selectedStudentIds.size === 0 ||
                  !testDate ||
                  assignMutation.isPending
                }
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  `Assign Test to ${selectedStudentIds.size} Student(s)`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/teacher/adtm/students");
        }}
        title="Assignment Successful!"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <p className="text-center text-lg font-medium">
            Successfully assigned {assignedCount} student(s) to{" "}
            {selectedTemplate?.testCode}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary-400" />
              <span>{assignedCount} students assigned</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary-400" />
              <span>
                Test date:{" "}
                {testDate
                  ? format(new Date(testDate), "MMM d, yyyy")
                  : "Not set"}
              </span>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={resetAll} className="flex-1">
              Assign More Students
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/teacher/grading");
              }}
              className="flex-1"
            >
              Go to Grading List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper function
function getMostCommon<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  arr.forEach((item) => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  return (
    Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || arr[0]
  );
}
