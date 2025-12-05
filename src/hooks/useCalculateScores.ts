import { useMemo } from "react";
import type { ITestQuestion } from "@/types/test.types";

interface CalculateSection1ScoresParams {
  questions: ITestQuestion[];
  answers: Record<string, number | null | undefined>;
}

interface Section1Scores {
  rawScore: number;
  maxScore: number;
  standardScore: number;
  correctCount: number;
  mistakeCount: number;
  unsolvedCount: number;
}

/**
 * Calculate Section 1 scores in real-time
 */
export function useCalculateSection1Scores({
  questions,
  answers,
}: CalculateSection1ScoresParams): Section1Scores {
  return useMemo(() => {
    let rawScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let mistakeCount = 0;
    let unsolvedCount = 0;

    for (const question of questions) {
      const score = answers[question.id] ?? 0;
      const questionMaxScore = question.score;

      rawScore += score;
      maxScore += questionMaxScore;

      if (score === 0) {
        unsolvedCount++;
      } else if (score === questionMaxScore) {
        correctCount++;
      } else {
        mistakeCount++;
      }
    }

    const standardScore = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;

    return {
      rawScore,
      maxScore,
      standardScore: Math.round(standardScore * 100) / 100,
      correctCount,
      mistakeCount,
      unsolvedCount,
    };
  }, [questions, answers]);
}

interface CalculateSectionScoresParams {
  questions: ITestQuestion[];
  answers: Record<string, number | null | undefined>;
}

interface UnitScore {
  unitName: string;
  rawScore: number;
  maxScore: number;
  standardScore: number;
  questionCount: number;
}

interface SectionScores {
  rawScore: number;
  maxScore: number;
  standardScore: number;
  unitScores: UnitScore[];
}

/**
 * Calculate Section 2-5 scores with unit grouping
 */
export function useCalculateSectionScores({
  questions,
  answers,
}: CalculateSectionScoresParams): SectionScores {
  return useMemo(() => {
    // Group questions by unit
    const unitGroups: Record<string, ITestQuestion[]> = {};
    for (const question of questions) {
      const unitName = question.unitName || "No Unit";
      if (!unitGroups[unitName]) {
        unitGroups[unitName] = [];
      }
      unitGroups[unitName].push(question);
    }

    // Calculate unit scores
    const unitScores: UnitScore[] = [];
    let sectionRawScore = 0;
    let sectionMaxScore = 0;

    for (const [unitName, unitQuestions] of Object.entries(unitGroups)) {
      let unitRawScore = 0;
      let unitMaxScore = 0;

      for (const question of unitQuestions) {
        const score = answers[question.id] ?? 0;
        unitRawScore += score;
        unitMaxScore += question.score;
      }

      const unitStandardScore =
        unitMaxScore > 0 ? (unitRawScore / unitMaxScore) * 100 : 0;

      unitScores.push({
        unitName,
        rawScore: unitRawScore,
        maxScore: unitMaxScore,
        standardScore: Math.round(unitStandardScore * 100) / 100,
        questionCount: unitQuestions.length,
      });

      sectionRawScore += unitRawScore;
      sectionMaxScore += unitMaxScore;
    }

    const sectionStandardScore =
      sectionMaxScore > 0 ? (sectionRawScore / sectionMaxScore) * 100 : 0;

    return {
      rawScore: sectionRawScore,
      maxScore: sectionMaxScore,
      standardScore: Math.round(sectionStandardScore * 100) / 100,
      unitScores,
    };
  }, [questions, answers]);
}

/**
 * Calculate simple section scores (for sections without units)
 */
export function useCalculateSimpleSectionScores({
  questions,
  answers,
}: CalculateSectionScoresParams): Omit<SectionScores, "unitScores"> {
  return useMemo(() => {
    let rawScore = 0;
    let maxScore = 0;

    for (const question of questions) {
      const score = answers[question.id] ?? 0;
      rawScore += score;
      maxScore += question.score;
    }

    const standardScore = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;

    return {
      rawScore,
      maxScore,
      standardScore: Math.round(standardScore * 100) / 100,
    };
  }, [questions, answers]);
}
