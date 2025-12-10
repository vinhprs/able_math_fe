import { useState, useEffect } from "react";

interface Question {
  score: number;
}

interface ScoreValidation {
  isValid: boolean;
  totalScore: number;
  difference: number;
  targetScore: number;
}

export function useScoreValidation(
  questions: Question[],
  targetScore: number = 100
): ScoreValidation {
  const [validation, setValidation] = useState<ScoreValidation>({
    isValid: false,
    totalScore: 0,
    difference: 0,
    targetScore,
  });

  useEffect(() => {
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const difference = totalScore - targetScore;
    const isValid = Math.abs(difference) < 0.01;

    setValidation({
      isValid,
      totalScore,
      difference,
      targetScore,
    });
  }, [questions, targetScore]);

  return validation;
}
