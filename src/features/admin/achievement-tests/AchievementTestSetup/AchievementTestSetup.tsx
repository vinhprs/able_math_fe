import { Card } from "@/components/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Step1_InitialSetup } from "./Step1_InitialSetup";
import { Step2_UnitSelection } from "./Step2_UnitSelection";
import { Step3_QuestionConfig } from "./Step3_QuestionConfig";
import { Step4_AnswerEntry } from "./Step4_AnswerEntry";
import { Step5_ReviewSave } from "./Step5_ReviewSave";
import { StepIndicator } from "./StepIndicator";
import type { TestSetupData } from "./types";

const STEPS = [
  { number: 1, title: "Setup", description: "Basic info" },
  { number: 2, title: "Units", description: "Select units" },
  { number: 3, title: "Questions", description: "Configure" },
  { number: 4, title: "Answers", description: "Enter answers" },
  { number: 5, title: "Review", description: "Finalize" },
];

export function AchievementTestSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [testData, setTestData] = useState<Partial<TestSetupData>>({});

  const handleNext = (stepData: Partial<TestSetupData>) => {
    setTestData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    // Navigate to list page
    navigate("/admin/achievement-tests");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_InitialSetup onNext={handleNext} initialData={testData} />
        );
      case 2:
        return (
          <Step2_UnitSelection
            onNext={handleNext}
            onBack={handleBack}
            initialData={testData}
          />
        );
      case 3:
        return (
          <Step3_QuestionConfig
            onNext={handleNext}
            onBack={handleBack}
            initialData={testData}
          />
        );
      case 4:
        return (
          <Step4_AnswerEntry
            onNext={handleNext}
            onBack={handleBack}
            initialData={testData}
          />
        );
      case 5:
        return (
          <Step5_ReviewSave
            onBack={handleBack}
            onComplete={handleComplete}
            testData={testData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Create Achievement Test Code</h1>
      <p className="text-gray-600 mb-8">
        Enter answer keys for existing test paper (PDF)
      </p>

      <Card className="p-6">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="mt-8">{renderStep()}</div>
      </Card>
    </div>
  );
}
