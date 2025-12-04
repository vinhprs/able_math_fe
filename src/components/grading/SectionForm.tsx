import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import type { ITestQuestion } from '@/types/test.types';

interface SectionFormProps {
  sectionNumber: number;
  sectionTitle: string;
  questions: ITestQuestion[];
  answers: Record<string, number>;
  onAnswerChange: (questionId: string, score: number) => void;
}

export function SectionForm({
  sectionNumber: _sectionNumber,
  sectionTitle: _sectionTitle,
  questions,
  answers,
  onAnswerChange,
}: SectionFormProps) {
  // Group questions by unit
  const unitGroups = useMemo(() => {
    const groups: Record<string, ITestQuestion[]> = {};

    questions.forEach((q) => {
      const unitName = q.unitName || 'Unknown';
      if (!groups[unitName]) {
        groups[unitName] = [];
      }
      groups[unitName].push(q);
    });

    return groups;
  }, [questions]);

  // Calculate unit scores
  const unitScores = useMemo(() => {
    const scores: Record<string, { rawScore: number; maxScore: number; standardScore: number }> =
      {};

    Object.entries(unitGroups).forEach(([unitName, unitQuestions]) => {
      const rawScore = unitQuestions.reduce(
        (sum, q) => sum + (answers[q.id] ?? 0),
        0
      );
      const maxScore = unitQuestions.reduce((sum, q) => sum + q.score, 0);
      const standardScore = maxScore > 0 ? Math.round((rawScore / maxScore) * 100 * 100) / 100 : 0;

      scores[unitName] = { rawScore, maxScore, standardScore };
    });

    return scores;
  }, [unitGroups, answers]);

  // Calculate section total
  const sectionTotal = useMemo(() => {
    const rawScore = Object.values(unitScores).reduce((sum, unit) => sum + unit.rawScore, 0);
    const maxScore = Object.values(unitScores).reduce((sum, unit) => sum + unit.maxScore, 0);
    const standardScore = maxScore > 0 ? Math.round((rawScore / maxScore) * 100 * 100) / 100 : 0;

    return { rawScore, maxScore, standardScore };
  }, [unitScores]);

  return (
    <div className="space-y-6">
      {/* Unit Groups */}
      {Object.entries(unitGroups).map(([unitName, unitQuestions]) => {
        const unitScore = unitScores[unitName];

        return (
          <Card key={unitName}>
            <CardHeader>
              <CardTitle>Unit: {unitName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {unitQuestions.map((question) => {
                  const earnedScore = answers[question.id] ?? 0;
                  const maxScore = question.score;

                  return (
                    <div
                      key={question.id}
                      className="flex items-center gap-4 p-3 border border-secondary-200 rounded-lg"
                    >
                      <div className="w-16 text-sm font-medium text-secondary-700">
                        Q{question.questionNumber}:
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          max={maxScore}
                          value={earnedScore || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const clampedValue = Math.max(0, Math.min(maxScore, value));
                            onAnswerChange(question.id, clampedValue);
                          }}
                          className="w-20"
                        />
                        <span className="text-sm text-secondary-500">/ {maxScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-secondary-200">
                <div className="text-sm font-medium text-secondary-700">
                  Unit Score: {unitScore.rawScore}/{unitScore.maxScore} ({unitScore.standardScore}%)
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Section Total */}
      <Card>
        <CardHeader>
          <CardTitle>Section Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-secondary-900">
              {sectionTotal.rawScore}/{sectionTotal.maxScore}
            </div>
            <div className="text-lg text-secondary-600 mt-1">
              ({sectionTotal.standardScore}%)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

