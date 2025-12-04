import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Badge } from '@/components/ui';
import type { ITestQuestion } from '@/types/test.types';

interface Section1FormProps {
  questions: ITestQuestion[];
  answers: Record<string, number>;
  concentrationLevel: number | null;
  currentMood: number | null;
  expectedScore: number | null;
  onConcentrationChange: (level: number) => void;
  onMoodChange: (mood: number) => void;
  onExpectedScoreChange: (score: number) => void;
  onAnswerChange: (questionId: string, score: number) => void;
}

export function Section1Form({
  questions,
  answers,
  concentrationLevel,
  currentMood,
  expectedScore,
  onConcentrationChange,
  onMoodChange,
  onExpectedScoreChange,
  onAnswerChange,
}: Section1FormProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    let correctCount = 0;
    let mistakeCount = 0;
    let unsolvedCount = 0;
    let rawScore = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      const earnedScore = answers[q.id] ?? 0;
      const questionMaxScore = q.score;

      rawScore += earnedScore;
      maxScore += questionMaxScore;

      if (earnedScore === 0) {
        unsolvedCount++;
      } else if (earnedScore === questionMaxScore) {
        correctCount++;
      } else {
        mistakeCount++;
      }
    });

    const standardScore = maxScore > 0 ? Math.round((rawScore / maxScore) * 100 * 100) / 100 : 0;

    return {
      correctCount,
      mistakeCount,
      unsolvedCount,
      rawScore,
      maxScore,
      standardScore,
    };
  }, [questions, answers]);

  const getAnswerStatus = (earnedScore: number, maxScore: number): string => {
    if (earnedScore === 0) return 'Unsolved';
    if (earnedScore === maxScore) return 'Correct';
    return 'Mistake';
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    if (status === 'Correct') return 'success';
    if (status === 'Mistake') return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Pre-test Information */}
      <Card>
        <CardHeader>
          <CardTitle>Student Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Concentration Level */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Concentration Level
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onConcentrationChange(level)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    concentrationLevel === level
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Current Mood */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Current Mood
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => onMoodChange(mood)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    currentMood === mood
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Score */}
          <div>
            <Input
              label="Expected Score"
              type="number"
              min="0"
              value={expectedScore ?? ''}
              onChange={(e) => onExpectedScoreChange(parseFloat(e.target.value) || 0)}
              placeholder="Enter expected score"
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Question Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.map((question) => {
              const earnedScore = answers[question.id] ?? 0;
              const maxScore = question.score;
              const status = getAnswerStatus(earnedScore, maxScore);

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
                    <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Auto-calculated Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-calculated Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.correctCount}</div>
              <div className="text-sm text-secondary-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.mistakeCount}</div>
              <div className="text-sm text-secondary-500">Mistake</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-500">{stats.unsolvedCount}</div>
              <div className="text-sm text-secondary-500">Unsolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-900">
                {stats.rawScore}/{stats.maxScore}
              </div>
              <div className="text-sm text-secondary-500">Raw Score</div>
              <div className="text-xs text-secondary-400">({stats.standardScore}%)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

