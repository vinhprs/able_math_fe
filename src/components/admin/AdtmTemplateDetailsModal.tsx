import {
  Modal,
  Button,
  Badge,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useAdtmTemplateDetails } from "@/hooks/useAdtmTemplates";
import { Download, Loader2 } from "lucide-react";
import type { AdtmTemplateSection } from "@/types/adtm-template.types";
import { DifficultyLevel } from "@/shared/types/enum";

interface AdtmTemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
}

export function AdtmTemplateDetailsModal({
  isOpen,
  onClose,
  templateId,
}: AdtmTemplateDetailsModalProps) {
  const { data, isLoading } = useAdtmTemplateDetails(templateId);

  const handleExport = () => {
    if (!data?.template) return;

    const exportData = {
      id: data.template.id,
      testCode: data.template.testCode,
      title: data.template.title,
      grade: data.template.grade,
      semester: data.template.semester,
      totalScore: data.template.totalScore,
      sections: data.template.sections,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.template.testCode}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={data?.template?.testCode}
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : data?.template ? (
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-secondary-500">Code</p>
                  <p className="text-sm font-medium">
                    {data.template.testCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Grade</p>
                  <p className="text-sm font-medium">{data.template.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Semester</p>
                  <p className="text-sm font-medium">
                    {data.template.semester}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Total Score</p>
                  <p className="text-sm font-medium">
                    {data.template.totalScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Status</p>
                  <p className="text-sm font-medium">
                    {data.template.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="default">Inactive</Badge>
                    )}
                  </p>
                </div>
                {data.template.pdfFile && (
                  <div>
                    <p className="text-xs text-secondary-500">PDF File</p>
                    <p className="text-sm font-medium">
                      {data.template.pdfFile}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {data.template.sections.map((section) => (
            <SectionDetails key={section.number} section={section} />
          ))}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <p className="text-center text-secondary-500 py-12">
          Template not found
        </p>
      )}
    </Modal>
  );
}

function SectionDetails({ section }: { section: AdtmTemplateSection }) {
  const getDifficultyBadge = (difficulty?: DifficultyLevel) => {
    if (!difficulty) return <Badge variant="default">-</Badge>;
    const variants: Record<DifficultyLevel, "default" | "warning" | "danger"> =
      {
        [DifficultyLevel.LOW]: "default",
        [DifficultyLevel.MEDIUM]: "warning",
        [DifficultyLevel.HIGH]: "danger",
      };
    return <Badge variant={variants[difficulty]}>{difficulty}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Section {section.number}: {section.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-secondary-500">Questions</p>
            <p className="text-sm font-medium">{section.questionCount}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-500">Max Score</p>
            <p className="text-sm font-medium">{section.maxScore}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-500">Special Inputs</p>
            <p className="text-sm font-medium">
              {section.hasSpecialInputs ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Section 1, 4, 5: Questions List */}
        {section.questions && (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 px-3">Q#</th>
                  <th className="text-left py-2 px-3">Max Score</th>
                  <th className="text-left py-2 px-3">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {section.questions.map((q) => (
                  <tr key={q.id} className="border-b border-secondary-100">
                    <td className="py-2 px-3">{q.questionNumber}</td>
                    <td className="py-2 px-3">{q.score}</td>
                    <td className="py-2 px-3">
                      {getDifficultyBadge(q.difficulty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 2, 3: Units Breakdown */}
        {section.units && (
          <div className="space-y-4">
            {section.units.map((unit) => (
              <Card key={unit.name} className="bg-secondary-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{unit.name}</CardTitle>
                    <p className="text-sm text-secondary-600">
                      {unit.questionCount}Q • Max: {unit.maxScore}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unit.questions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between py-1 px-2 bg-white rounded"
                      >
                        <span className="text-sm">Q{q.questionNumber}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-secondary-600">
                            {q.score}pts
                          </span>
                          {getDifficultyBadge(q.difficulty)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fixed structure notice for Sections 4 & 5 */}
        {(section.number === 4 || section.number === 5) && (
          <Alert variant="info">
            Fixed structure: 4 questions × 10 points each = 40 points
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
