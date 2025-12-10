import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdtmTemplate } from "./templates/adtm-templates";
import { StepIndicator } from "./components/StepIndicator";
import { Section1Screen } from "./Section1Screen";
import { SectionsScreen } from "./SectionsScreen";
import api from "@/lib/api";

interface SubmissionData {
  id: string;
  student: {
    id: string;
    name: string;
    studentId: string;
    grade: string;
  };
  test: {
    id: string;
    testCode: string;
    title: string;
  };
  status: string;
  testDate: string;
  overallScore: number | null;
  progress: number;
  answersBySection?: Record<number, any[]>;
  adtmData?: {
    concentrationLevel: number | null;
    currentMood: string | null;
    expectedScore: number | null;
  };
}

export function AdtmGradingLayout() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [currentSection, setCurrentSection] = useState(1);
  const [template, setTemplate] = useState<ReturnType<
    typeof getAdtmTemplate
  > | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load submission data and template
  useEffect(() => {
    if (submissionId) {
      loadSubmissionData();
    }
  }, [submissionId]);

  const loadSubmissionData = async () => {
    try {
      setIsLoading(true);

      // Get submission from backend
      const response = await api.get<{
        success: boolean;
        data: SubmissionData;
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}`);

      const sub = response.data.data;

      // Get template based on test code
      const tmpl = getAdtmTemplate(sub.test.testCode);

      if (!tmpl) {
        throw new Error(
          `Template not found for test code: ${sub.test.testCode}`
        );
      }

      setSubmission(sub);
      setTemplate(tmpl);

      // Resume from last section if partially completed
      // This would need to be determined from submission status/progress
      // For now, start from section 1
    } catch (error) {
      console.error("Failed to load submission:", error);
      alert("Failed to load test data");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSaving && submission) {
        autoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentSection, isSaving, submission]);

  const autoSave = async () => {
    // Auto-save current progress
    console.log("Auto-saving progress...");
    // Implementation would save current section data
    // This is a placeholder - actual implementation would depend on form state
  };

  const handleSectionComplete = async (sectionData: any) => {
    try {
      setIsSaving(true);

      const sectionNumber = sectionData.sectionId;

      // Map question numbers to question IDs
      // Get answers for current section
      const sectionAnswers =
        submission?.answersBySection?.[sectionNumber] || [];

      // Create a map from question number to question ID
      const questionNumberToId = new Map<number, string>();
      sectionAnswers.forEach((answer: any) => {
        if (answer.question) {
          questionNumberToId.set(
            answer.question.questionNumber,
            answer.question.id
          );
        }
      });

      // Convert question scores (keyed by question number) to answers array (with question IDs)
      const answers = Object.entries(sectionData.questionScores)
        .map(([questionNumberStr, score]) => {
          const questionNumber = parseInt(questionNumberStr, 10);
          const questionId = questionNumberToId.get(questionNumber);

          if (!questionId) {
            console.warn(
              `Question ID not found for question number ${questionNumber}`
            );
            return null;
          }

          return {
            questionId,
            score: score as number,
          };
        })
        .filter((answer) => answer !== null);

      // Save section data to backend
      if (sectionNumber === 1) {
        // Section 1 has special format
        await api.put(`/teacher/adtm/submissions/${submissionId}/section1`, {
          concentrationLevel: sectionData.specialInputs.concentration,
          currentMood: sectionData.specialInputs.mood,
          expectedScore: sectionData.specialInputs.expectedScore,
          answers,
        });
      } else {
        // Sections 2-5
        await api.put(
          `/teacher/adtm/submissions/${submissionId}/section${sectionNumber}`,
          {
            answers,
          }
        );
      }

      // Move to next section or finalize
      if (currentSection < 5) {
        setCurrentSection(currentSection + 1);
      } else {
        // All sections complete - finalize grading
        await finalizeGrading();
      }
    } catch (error) {
      console.error("Failed to save section:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const finalizeGrading = async () => {
    try {
      // Call finalize endpoint
      await api.post<{
        success: boolean;
        message: string;
        result: any;
        report: {
          id: string;
          url: string;
        };
      }>(`/teacher/adtm/submissions/${submissionId}/finalize`);

      alert("Grading completed successfully!");

      // Navigate to report
      navigate(`/teacher/adtm/report/${submissionId}`);
    } catch (error) {
      console.error("Failed to finalize:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading test data...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Template not found</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Submission not found</div>
      </div>
    );
  }

  const currentSectionData = template.sections[currentSection - 1];

  // Get initial data for current section
  const getInitialData = () => {
    // Get answers for current section
    const sectionAnswers = submission?.answersBySection?.[currentSection] || [];

    // Create a map from question number to score
    const questionScores: Record<number, number> = {};
    sectionAnswers.forEach((answer: any) => {
      if (
        answer.question &&
        answer.scoreEarned !== null &&
        answer.scoreEarned !== undefined
      ) {
        questionScores[answer.question.questionNumber] = answer.scoreEarned;
      }
    });

    if (currentSection === 1 && submission.adtmData) {
      return {
        concentration: submission.adtmData.concentrationLevel || undefined,
        mood: submission.adtmData.currentMood
          ? parseInt(submission.adtmData.currentMood, 10)
          : undefined,
        expectedScore: submission.adtmData.expectedScore || undefined,
        questionScores,
      };
    }
    return {
      questionScores,
    };
  };

  return (
    <div className="adtm-grading-layout min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            A-DTM Grading: {template.testName}
          </h1>
          <div className="mt-2 text-sm text-gray-600">
            Student: {submission.student.name} | Grade: {template.grade}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <StepIndicator current={currentSection} total={5} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentSection === 1 ? (
          <Section1Screen
            section={currentSectionData}
            initialData={getInitialData()}
            onComplete={handleSectionComplete}
            isSubmitting={isSaving}
          />
        ) : (
          <SectionsScreen
            section={currentSectionData}
            initialData={getInitialData()}
            onComplete={handleSectionComplete}
            isSubmitting={isSaving}
          />
        )}
      </div>
    </div>
  );
}
