import { useMemo } from 'react';
import { useAdtmGradingStore } from '@/store/adtmGradingStore';
import { useCalculateSimpleSectionScores } from '@/hooks/useCalculateScores';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Alert,
} from '@/components/ui';
import { Info, Star, ThumbsUp, AlertTriangle } from 'lucide-react';
import type { ITestQuestion } from '@/types/test.types';

interface SimpleSectionGradingProps {
  sectionNumber: 4 | 5;
  sectionName: string;
  questions: ITestQuestion[];
  onPrevious: () => void;
  onNext: () => void;
}

export function SimpleSectionGrading({
  sectionNumber,
  sectionName,
  questions,
  onPrevious,
  onNext,
}: SimpleSectionGradingProps) {
  const { section4, section5, setSectionAnswer } = useAdtmGradingStore();
  const sectionData = sectionNumber === 4 ? section4 : section5;

  const scores = useCalculateSimpleSectionScores({
    questions,
    answers: sectionData.answers,
  });

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const clampedValue = Math.max(0, Math.min(question.score, numValue));
      setSectionAnswer(sectionNumber, questionId, clampedValue);
    }
  };

  const canProceed = questions.every((q) => sectionData.answers[q.id] !== undefined);

  const performanceLevel = useMemo(() => {
    if (scores.standardScore >= 80) return 'excellent';
    if (scores.standardScore >= 60) return 'good';
    return 'needsImprovement';
  }, [scores.standardScore]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Section {sectionNumber}</h2>
          <h3 className="text-xl text-secondary-600">{sectionName}</h3>
        </div>

        <div className="flex gap-4">
          <Badge variant="info">4 Questions (Fixed)</Badge>
          <Badge variant="info">Max 40 pts</Badge>
          <Badge variant="success" className="font-semibold">
            Raw: {scores.rawScore}/40
          </Badge>
          <Badge variant="success" className="font-semibold">
            Standard: {scores.standardScore.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="info">
        <Info className="w-5 h-5" />
        <div>
          <div className="font-medium">Fixed Structure</div>
          <div className="text-sm mt-1">
            Sections 4 and 5 always have exactly 4 questions, each worth 10 points.
          </div>
        </div>
      </Alert>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Score Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const score = sectionData.answers[question.id] ?? 0;

              return (
                <div
                  key={question.id}
                  className="flex items-center gap-4 p-4 border border-secondary-200 rounded-lg bg-white"
                >
                  <div className="w-32">
                    <div className="font-semibold text-lg">Question {index + 1}</div>
                    <div className="text-sm text-secondary-500">10 points</div>
                  </div>

                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={score || ''}
                    onChange={(e) => handleScoreChange(question.id, e.target.value)}
                    className="w-32 text-center text-lg"
                    placeholder="0"
                  />

                  <div className="flex gap-2 flex-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSectionAnswer(sectionNumber, question.id, 0)}
                    >
                      0
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSectionAnswer(sectionNumber, question.id, 5)}
                    >
                      5
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSectionAnswer(sectionNumber, question.id, 10)}
                    >
                      10
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Section {sectionNumber} Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-600">Raw Score</span>
                <span className="text-3xl font-bold">
                  {scores.rawScore} <span className="text-xl text-secondary-500">/ 40</span>
                </span>
              </div>
              <div className="w-full h-4 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all"
                  style={{ width: `${(scores.rawScore / 40) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-600">Standard Score</span>
                <span className="text-3xl font-bold text-primary-600">
                  {scores.standardScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-4 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${scores.standardScore}%` }}
                />
              </div>
            </div>

            {/* Performance Indicator */}
            <div className="pt-4 border-t border-secondary-200">
              {performanceLevel === 'excellent' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                  <Star className="w-5 h-5" />
                  <span className="font-medium">Excellent Performance</span>
                </div>
              )}
              {performanceLevel === 'good' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">Good Performance</span>
                </div>
              )}
              {performanceLevel === 'needsImprovement' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Needs Improvement</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous Section
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          {sectionNumber === 5 ? (
            <Button variant="primary" onClick={onNext} disabled={!canProceed}>
              Review & Submit →
            </Button>
          ) : (
            <Button variant="primary" onClick={onNext} disabled={!canProceed}>
              Next: Section {sectionNumber + 1} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

