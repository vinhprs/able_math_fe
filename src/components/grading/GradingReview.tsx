import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { ITestQuestion } from '@/types/test.types';
import { useAdtmGradingStore } from '@/store/adtmGradingStore';

interface GradingReviewProps {
  questions: ITestQuestion[];
  section1Questions: ITestQuestion[];
  section2Questions: ITestQuestion[];
  section3Questions: ITestQuestion[];
  section4Questions: ITestQuestion[];
  section5Questions: ITestQuestion[];
}

export function GradingReview({
  questions,
  section1Questions,
  section2Questions,
  section3Questions,
  section4Questions,
  section5Questions,
}: GradingReviewProps) {
  const { section1, section2, section3, section4, section5 } = useAdtmGradingStore();

  // Calculate Section 1 stats
  const section1Stats = useMemo(() => {
    let correctCount = 0;
    let mistakeCount = 0;
    let unsolvedCount = 0;
    let rawScore = 0;
    let maxScore = 0;

    section1Questions.forEach((q) => {
      const earnedScore = section1.answers[q.id] ?? 0;
      rawScore += earnedScore;
      maxScore += q.score;

      if (earnedScore === 0) unsolvedCount++;
      else if (earnedScore === q.score) correctCount++;
      else mistakeCount++;
    });

    const standardScore = maxScore > 0 ? Math.round((rawScore / maxScore) * 100 * 100) / 100 : 0;

    return { correctCount, mistakeCount, unsolvedCount, rawScore, maxScore, standardScore };
  }, [section1Questions, section1.answers]);

  // Calculate section stats (2-5)
  const calculateSectionStats = (
    sectionQuestions: ITestQuestion[],
    sectionAnswers: Record<string, number>
  ) => {
    const unitGroups: Record<string, ITestQuestion[]> = {};
    sectionQuestions.forEach((q) => {
      const unitName = q.unitName || 'Unknown';
      if (!unitGroups[unitName]) unitGroups[unitName] = [];
      unitGroups[unitName].push(q);
    });

    const unitScores = Object.entries(unitGroups).map(([unitName, unitQuestions]) => {
      const rawScore = unitQuestions.reduce((sum, q) => sum + (sectionAnswers[q.id] ?? 0), 0);
      const maxScore = unitQuestions.reduce((sum, q) => sum + q.score, 0);
      const standardScore =
        maxScore > 0 ? Math.round((rawScore / maxScore) * 100 * 100) / 100 : 0;
      return { unitName, rawScore, maxScore, standardScore };
    });

    const rawScore = unitScores.reduce((sum, u) => sum + u.rawScore, 0);
    const maxScore = unitScores.reduce((sum, u) => sum + u.maxScore, 0);
    const standardScore = maxScore > 0 ? Math.round((rawScore / maxScore) * 100 * 100) / 100 : 0;

    return { rawScore, maxScore, standardScore, unitScores };
  };

  const section2Stats = useMemo(
    () => calculateSectionStats(section2Questions, section2.answers),
    [section2Questions, section2.answers]
  );
  const section3Stats = useMemo(
    () => calculateSectionStats(section3Questions, section3.answers),
    [section3Questions, section3.answers]
  );
  const section4Stats = useMemo(
    () => calculateSectionStats(section4Questions, section4.answers),
    [section4Questions, section4.answers]
  );
  const section5Stats = useMemo(
    () => calculateSectionStats(section5Questions, section5.answers),
    [section5Questions, section5.answers]
  );

  // Calculate overall score
  const overallStats = useMemo(() => {
    const totalRaw =
      section1Stats.rawScore +
      section2Stats.rawScore +
      section3Stats.rawScore +
      section4Stats.rawScore +
      section5Stats.rawScore;
    const totalMax =
      section1Stats.maxScore +
      section2Stats.maxScore +
      section3Stats.maxScore +
      section4Stats.maxScore +
      section5Stats.maxScore;
    const standardScore = totalMax > 0 ? Math.round((totalRaw / totalMax) * 100 * 100) / 100 : 0;

    return { totalRaw, totalMax, standardScore };
  }, [section1Stats, section2Stats, section3Stats, section4Stats, section5Stats]);

  return (
    <div className="space-y-6">
      {/* Section 1 Review */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1: Calculation Ability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              {section1Stats.rawScore}/{section1Stats.maxScore} ({section1Stats.standardScore}%)
            </div>
            <div className="text-sm text-secondary-600">
              Correct: {section1Stats.correctCount} | Mistake: {section1Stats.mistakeCount} |
              Unsolved: {section1Stats.unsolvedCount}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections 2-5 Review */}
      {[
        { num: 2, title: 'Conceptual Understanding', stats: section2Stats },
        { num: 3, title: 'Conceptual Application', stats: section3Stats },
        { num: 4, title: 'Reasoning Ability', stats: section4Stats },
        { num: 5, title: 'Problem-Solving Ability', stats: section5Stats },
      ].map((section) => (
        <Card key={section.num}>
          <CardHeader>
            <CardTitle>Section {section.num}: {section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {section.stats.rawScore}/{section.stats.maxScore} ({section.stats.standardScore}%)
              </div>
              <div className="text-sm text-secondary-600">
                {section.stats.unitScores
                  .map((u) => `${u.unitName}: ${u.standardScore}%`)
                  .join(' | ')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Overall Score */}
      <Card className="border-2 border-primary-500">
        <CardHeader>
          <CardTitle className="text-primary-700">Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-primary-600">
              {overallStats.standardScore}%
            </div>
            <div className="text-lg text-secondary-600 mt-2">
              {overallStats.totalRaw}/{overallStats.totalMax} points
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

