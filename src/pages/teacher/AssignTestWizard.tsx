import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import { assignmentService } from '@/services/assignmentService';
import { classService } from '@/services/classService';
import { useTeacherTests } from '@/hooks/useTeacherTests';
import { toastSuccess, toastError } from '@/lib/toast';
import type { ITest } from '@/types/test.types';
import type { IClass } from '@/types/class';
import type { IAssignToClassDto } from '@/types/assignment';

type Step = 1 | 2 | 3 | 4;

export default function AssignTestWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  
  // Get classId from URL params
  const classIdFromUrl = searchParams.get('classId');

  // Fetch published tests
  const { data: testsData, isLoading: testsLoading } = useTeacherTests({
    limit: 100,
  });

  // Fetch classes
  const [classes, setClasses] = useState<IClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  // Selected data
  const [selectedTest, setSelectedTest] = useState<ITest | null>(null);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');

  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setClassesLoading(true);
        const response = await classService.getAll({ limit: 100, isActive: true });
        setClasses(response.data);
        
        // If classId is in URL, pre-select the class but stay on step 1 to select test first
        if (classIdFromUrl) {
          const preSelectedClass = response.data.find(c => c.id === classIdFromUrl);
          if (preSelectedClass) {
            setSelectedClass(preSelectedClass);
            // Don't skip to step 2 - user still needs to select a test first
            // They can proceed to step 2 after selecting a test
          }
        }
      } catch (error) {
        console.error('Failed to load classes:', error);
        toastError('Failed to load classes');
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
  }, [classIdFromUrl]);

  const handleSubmit = async () => {
    if (!selectedTest || !selectedClass) return;

    try {
      setLoading(true);
      // Convert datetime-local format to ISO string
      const deadlineISO = deadline ? new Date(deadline).toISOString() : undefined;
      
      const assignData: IAssignToClassDto = {
        testId: selectedTest.id,
        classId: selectedClass.id,
        deadline: deadlineISO,
        instructions: instructions || undefined,
      };

      const result = await assignmentService.assignToClass(assignData);

      toastSuccess(
        `Success! Assigned to ${result.assignedCount} students${
          result.skippedCount > 0 ? ` (${result.skippedCount} already had it)` : ''
        }`
      );

      navigate('/teacher/assignments');
    } catch (error: any) {
      console.error('Failed to assign test:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to assign test';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return selectedTest !== null;
    if (currentStep === 2) return selectedClass !== null;
    return true;
  };

  const nextStep = () => {
    if (canGoNext() && currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const tests = testsData?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign Test to Class</h1>
          <p className="text-gray-600 mt-1">Follow the steps to assign a test</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step, idx) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step === 1 && 'Select Test'}
                  {step === 2 && 'Select Class'}
                  {step === 3 && 'Set Details'}
                  {step === 4 && 'Confirm'}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6 min-h-[400px]">
        {/* Step 1: Select Test */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Select a Test</h2>
            </div>

            {testsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No published tests available</p>
                <button
                  onClick={() => navigate('/teacher/tests/browse')}
                  className="text-blue-600 hover:underline"
                >
                  Browse tests
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedTest?.id === test.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{test.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Code: {test.testCode}</p>
                      <p>
                        Type:{' '}
                        {test.testType === 'ACHIEVEMENT'
                          ? 'Achievement'
                          : test.testType === 'ADTM'
                            ? 'A-DTM'
                            : test.testType}
                      </p>
                      <p>
                        Grade: {test.grade} • Term: {test.term} • Level: {test.level}
                      </p>
                      <p>Total Score: {test.totalScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Class */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Select a Class</h2>
              {classIdFromUrl && selectedClass && (
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Pre-selected from URL
                </span>
              )}
            </div>

            {classesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No classes available</p>
                <button
                  onClick={() => navigate('/teacher/classes/new')}
                  className="text-blue-600 hover:underline"
                >
                  Create a class first
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    onClick={() => setSelectedClass(classItem)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedClass?.id === classItem.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{classItem.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Grade: {classItem.grade}{' '}
                        {classItem.term && `• Term: ${classItem.term}`}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {classItem.studentCount || classItem.students?.length || 0} students
                      </p>
                      {classItem.description && (
                        <p className="text-gray-500 line-clamp-2">{classItem.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Set Details */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Set Assignment Details</h2>
            </div>

            <div className="max-w-xl space-y-6">
              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no deadline</p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions for Students (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Please complete this test carefully. Show all your work."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Confirm Assignment</h2>
            </div>

            <div className="max-w-xl space-y-6">
              {/* Test Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Test</h3>
                <p className="text-gray-700">{selectedTest?.title}</p>
                <p className="text-sm text-gray-600">Code: {selectedTest?.testCode}</p>
              </div>

              {/* Class Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Class</h3>
                <p className="text-gray-700">{selectedClass?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedClass?.studentCount || selectedClass?.students?.length || 0} students
                  will receive this assignment
                </p>
              </div>

              {/* Details */}
              {(deadline || instructions) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
                  {deadline && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Deadline:</strong> {new Date(deadline).toLocaleString()}
                    </p>
                  )}
                  {instructions && (
                    <p className="text-sm text-gray-700">
                      <strong>Instructions:</strong> {instructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        {currentStep < 4 ? (
          <button
            onClick={nextStep}
            disabled={!canGoNext()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {(!selectedTest || !selectedClass) && (
              <p className="text-sm text-red-600">
                {!selectedTest && !selectedClass
                  ? 'Please select a test and class'
                  : !selectedTest
                    ? 'Please select a test'
                    : 'Please select a class'}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedTest || !selectedClass}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Assign Test
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

