import { useMemo } from 'react';
import type { ITestQuestion } from '@/types/test.types';
import type { DifficultyBreakdown } from '@/types/reports.types';

interface UseDifficultyBreakdownParams {
  questions: ITestQuestion[];
  answers: Record<string, number | null | undefined>;
}

/**
 * Calculate difficulty breakdown in real-time
 * Groups questions by difficulty (1-4) and calculates scores
 */
export function useDifficultyBreakdown({
  questions,
  answers,
}: UseDifficultyBreakdownParams): DifficultyBreakdown[] {
  return useMemo(() => {
    // Group questions and answers by difficulty
    const byDifficulty: Record<
      number,
      { questions: ITestQuestion[]; answers: Array<{ questionId: string; score: number }> }
    > = {
      1: { questions: [], answers: [] },
      2: { questions: [], answers: [] },
      3: { questions: [], answers: [] },
      4: { questions: [], answers: [] },
    };

    // Process each question
    for (const question of questions) {
      // Map difficulty: could be number (1-4) or enum string (HIGH/MEDIUM/LOW)
      let difficultyNum: number;
      if (typeof question.difficulty === 'number') {
        difficultyNum = question.difficulty;
      } else if (typeof question.difficulty === 'string') {
        // Map enum to number: LOW=1, MEDIUM=2, HIGH=3, (4 would need to be added)
        const difficultyMap: Record<string, number> = {
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
        };
        difficultyNum = difficultyMap[question.difficulty] || 1;
      } else {
        difficultyNum = 1; // Default
      }

      if (difficultyNum >= 1 && difficultyNum <= 4) {
        if (!byDifficulty[difficultyNum]) {
          byDifficulty[difficultyNum] = { questions: [], answers: [] };
        }
        byDifficulty[difficultyNum].questions.push(question);

        // Find corresponding answer
        const score = answers[question.id] ?? 0;
        if (score > 0 || true) {
          // Include all answers (even 0) for accurate calculation
          byDifficulty[difficultyNum].answers.push({
            questionId: question.id,
            score,
          });
        }
      }
    }

    // Calculate scores for each difficulty level
    return [1, 2, 3, 4].map((difficulty) => {
      const data = byDifficulty[difficulty];

      if (!data || data.questions.length === 0) {
        return {
          difficulty: difficulty as 1 | 2 | 3 | 4,
          fullMarks: 0,
          rawScore: 0,
          standardScore: 0,
        };
      }

      const fullMarks = data.questions.reduce((sum, q) => sum + (q.score || 0), 0);
      const rawScore = data.answers.reduce((sum, a) => sum + a.score, 0);
      const standardScore = fullMarks > 0 ? (rawScore / fullMarks) * 100 : 0;

      return {
        difficulty: difficulty as 1 | 2 | 3 | 4,
        fullMarks,
        rawScore,
        standardScore: Math.round(standardScore * 10) / 10, // Round to 1 decimal
      };
    });
  }, [questions, answers]);
}

/**
 * Analyze difficulty performance and generate insights
 */
export interface DifficultyInsight {
  type: 'success' | 'warning' | 'error' | 'info';
  icon: string;
  message: string;
}

export function analyzeDifficultyPerformance(
  data: DifficultyBreakdown[],
): DifficultyInsight[] {
  const insights: DifficultyInsight[] = [];

  // Check for struggles with hard questions (Level 4)
  const level4 = data.find((d) => d.difficulty === 4);
  if (level4 && level4.standardScore < 40 && level4.fullMarks > 0) {
    insights.push({
      type: 'error',
      icon: 'alert-circle',
      message: `Struggling with very hard questions (${level4.standardScore.toFixed(1)}%). Consider additional practice.`,
    });
  }

  // Check for excellence in easy questions (Level 1)
  const level1 = data.find((d) => d.difficulty === 1);
  if (level1 && level1.standardScore === 100 && level1.fullMarks > 0) {
    insights.push({
      type: 'success',
      icon: 'check-circle',
      message: 'Perfect score on easy questions! Strong foundation.',
    });
  }

  // Check for inconsistent performance
  const scores = data.filter((d) => d.fullMarks > 0).map((d) => d.standardScore);
  if (scores.length > 1) {
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const variance = max - min;
    if (variance > 50) {
      // High variance
      insights.push({
        type: 'warning',
        icon: 'alert-triangle',
        message: 'Inconsistent performance across difficulty levels. Focus on weaker areas.',
      });
    }
  }

  // Check for good performance on medium-hard questions
  const level3 = data.find((d) => d.difficulty === 3);
  if (level3 && level3.standardScore >= 70 && level3.fullMarks > 0) {
    insights.push({
      type: 'success',
      icon: 'thumbs-up',
      message: `Good performance on hard questions (${level3.standardScore.toFixed(1)}%).`,
    });
  }

  return insights;
}

/**
 * Get performance level for a score
 */
export function getPerformanceLevel(
  score: number,
): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

/**
 * Calculate overall standard score from difficulty breakdown
 */
export function calculateOverallStandard(data: DifficultyBreakdown[]): number {
  const totalRaw = data.reduce((sum, d) => sum + d.rawScore, 0);
  const totalMax = data.reduce((sum, d) => sum + d.fullMarks, 0);
  return totalMax > 0 ? Math.round((totalRaw / totalMax) * 100 * 10) / 10 : 0;
}

