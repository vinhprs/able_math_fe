import type { AdtmReportData } from "@/types/reports.types";
import {
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReportAnalysisPageProps {
  reportData: AdtmReportData;
}

export function ReportAnalysisPage({ reportData }: ReportAnalysisPageProps) {
  const { sections, overallScore, charts } = reportData;

  // Calculate total raw score
  const totalRawScore = sections.reduce((sum, s) => sum + s.rawScore, 0);
  const totalMaxScore = sections.reduce((sum, s) => sum + s.maxScore, 0);

  return (
    <div
      className="bg-white p-8 min-h-screen print:p-8 report-page-2"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* Header */}
      <div className="flex items-center border-b-2 border-black pb-4 mb-6">
        <div className="text-red-600 text-4xl font-bold mr-4">able</div>
        <div className="text-sm">
          <div>Diagnostic</div>
          <div>Test of</div>
          <div>Mathematics</div>
        </div>
        <div className="text-6xl font-serif ml-8">Analysis</div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT COLUMN - Takes 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* 1. Score by Section */}
          <Section1ScoreTable
            sections={sections}
            totalRawScore={totalRawScore}
            totalMaxScore={totalMaxScore}
            overallScore={overallScore}
            testCode={reportData.test.testCode}
          />

          {/* 2. Score by Unit */}
          {sections[1]?.unitScores && sections[1].unitScores.length > 0 && (
            <Section2UnitTable units={sections[1].unitScores} />
          )}

          {/* 3. Calculation Ability Score */}
          {sections[0] && (
            <CalculationAbilityBreakdown section1={sections[0]} />
          )}

          {/* 4. Difficulty-Based Score */}
          {sections[0]?.difficultyBreakdown &&
            sections[0].difficultyBreakdown.length > 0 && (
              <DifficultyScoreTable
                difficulties={sections[0].difficultyBreakdown}
              />
            )}

          {/* 5. Condition & Concentration Chart */}
          <ConditionConcentrationChart sections={sections} />

          {/* 6. Calculation Ability Distribution */}
          {sections[0] && (
            <CalculationDistributionChart section1={sections[0]} />
          )}

          {/* 7. Unit Balance Radar */}
          {charts?.unitRadar && (
            <UnitBalanceRadar chartData={charts.unitRadar} />
          )}
        </div>

        {/* RIGHT COLUMN - Takes 1 column */}
        <div className="col-span-1 space-y-6">
          {/* Scoring Guide Info Box */}
          <ScoringGuideBox />

          {/* 8. Domain Scores (Section Bar Chart) */}
          {charts?.sectionBar && (
            <DomainScoresChart chartData={charts.sectionBar} />
          )}

          {/* 9. Domain-Unit Scores */}
          {sections[1]?.unitScores && sections[1].unitScores.length > 0 && (
            <DomainUnitChart units={sections[1].unitScores} />
          )}

          {/* 10. Domain-Difficulty Scores */}
          {sections[0]?.difficultyBreakdown &&
            sections[0].difficultyBreakdown.length > 0 && (
              <DomainDifficultyChart
                difficulties={sections[0].difficultyBreakdown}
              />
            )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function Section1ScoreTable({
  sections,
  totalRawScore,
  totalMaxScore,
  overallScore,
  testCode,
}: {
  sections: AdtmReportData["sections"];
  totalRawScore: number;
  totalMaxScore: number;
  overallScore: number;
  testCode?: string;
}) {
  console.log(totalMaxScore);
  const getCategory = (score: number) => {
    if (score >= 80) return "상";
    if (score >= 60) return "중";
    return "하";
  };

  const getEvaluation = (score: number) => {
    if (score >= 80) return "상";
    if (score >= 60) return "중";
    return "하";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  // Calculate expected scores (placeholder - should come from backend)
  const expectedScores = [80, 65, 55, 40, 0];

  return (
    <div className="border border-gray-300 p-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mr-2 text-sm font-bold">
          1
        </div>
        <h3 className="font-bold text-sm">Overall Score</h3>
        <span className="ml-auto text-xs text-gray-500">Score by Section</span>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center align-middle"
            >
              Section
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center align-middle"
            >
              Full
              <br />
              Score
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center align-middle"
            >
              Obtained
              <br />
              Score
            </th>
            <th
              colSpan={2}
              className="border border-gray-300 p-1 text-center text-red-500"
            >
              <div className="flex items-center justify-center">
                <span className="text-xs">
                  Change the test to "{testCode || "E3-M"}"
                </span>
              </div>
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center align-middle"
            >
              Category
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center align-middle"
            >
              Evaluation
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 p-2 text-center align-middle"
            >
              Condition
            </th>
          </tr>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 p-2 text-center">
              Standard-
              <br />
              ized Score
            </th>
            <th className="border border-gray-300 p-2 text-center">
              Expected
              <br />
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section, idx) => {
            const category = getCategory(section.standardScore);
            const evaluation = getEvaluation(section.standardScore);
            const badgeColor = getScoreBadgeColor(section.standardScore);
            const isSection4Or5 = idx >= 3;
            // Full Score display: Sections 1-3 = 100, Sections 4-5 = 40
            const displayFullScore = isSection4Or5 ? 40 : 100;

            return (
              <tr key={idx}>
                <td className="border border-gray-300 p-2">
                  {idx + 1}. {section.name}
                </td>
                <td
                  className={`border border-gray-300 p-2 text-center ${
                    isSection4Or5 ? "bg-yellow-50" : ""
                  }`}
                >
                  {displayFullScore}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {section.rawScore}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${badgeColor} text-white font-bold text-xs`}
                  >
                    {section.standardScore.toFixed(0)}
                  </span>
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {expectedScores[idx] || 0}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {category}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {evaluation}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {idx < 3 ? idx + 3 : idx === 3 ? 2 : 1}
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-50 font-bold">
            <td className="border border-gray-300 p-2">
              Overall Math Learning
            </td>
            <td className="border border-gray-300 p-2 text-center bg-yellow-50">
              380
            </td>
            <td className="border border-gray-300 p-2 text-center">
              {totalRawScore}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white font-bold text-xs">
                {overallScore.toFixed(0)}
              </span>
            </td>
            <td className="border border-gray-300 p-2 text-center">48</td>
            <td className="border border-gray-300 p-2 text-center">하</td>
            <td className="border border-gray-300 p-2 text-center">3</td>
            <td className="border border-gray-300 p-2 text-center">2</td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      <div className="mt-2 flex items-start gap-4 text-xs">
        <div className="flex items-start">
          <div className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] mr-1 mt-0.5 flex-shrink-0">
            1
          </div>
          <span className="text-gray-600">
            Change the test to "{testCode || "E3-M"}"
          </span>
        </div>
        <div className="flex items-start">
          <div className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] mr-1 mt-0.5 flex-shrink-0">
            2
          </div>
          <span className="text-gray-600">
            Full score for each section = 100 points
          </span>
        </div>
      </div>

      {/* High/Medium/Low legend */}
      <div className="mt-2 text-center text-xs text-gray-600 border-t pt-2">
        <span className="font-medium">High / Medium / Low</span>
      </div>
    </div>
  );
}

function Section2UnitTable({
  units,
}: {
  units: Array<{
    unitName: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
  }>;
}) {
  const totalRaw = units.reduce((sum, u) => sum + u.rawScore, 0);
  const totalMax = units.reduce((sum, u) => sum + u.maxScore, 0);
  const totalStandard = totalMax > 0 ? (totalRaw / totalMax) * 100 : 0;

  const getCategory = (score: number) => {
    if (score >= 80) return "상";
    if (score >= 60) return "중";
    return "하";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="border border-gray-300 p-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mr-2 text-sm font-bold">
          2
        </div>
        <h3 className="font-bold text-sm">Score by Unit</h3>
        <span className="ml-auto text-xs text-gray-500">Score by Unit</span>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-300 p-2 text-left">Unit</th>
            <th className="border border-gray-300 p-2 text-center">
              Full Score
            </th>
            <th className="border border-gray-300 p-2 text-center">
              Obtained Score
            </th>
            <th className="border border-gray-300 p-2 text-center">
              Standardized Score
            </th>
            <th className="border border-gray-300 p-2 text-center">Category</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit, idx) => {
            const badgeColor = getScoreBadgeColor(unit.standardScore);
            return (
              <tr key={idx}>
                <td className="border border-gray-300 p-2">
                  {idx + 1}. {unit.unitName}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {unit.maxScore.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {unit.rawScore.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${badgeColor} text-white font-bold text-xs`}
                  >
                    {unit.standardScore.toFixed(0)}
                  </span>
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {getCategory(unit.standardScore)}
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-50 font-bold">
            <td className="border border-gray-300 p-2">합계 Sum</td>
            <td className="border border-gray-300 p-2 text-center">
              {totalMax.toFixed(0)}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              {totalRaw.toFixed(0)}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white font-bold text-xs">
                {totalStandard.toFixed(0)}
              </span>
            </td>
            <td className="border border-gray-300 p-2 text-center">
              {getCategory(totalStandard)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CalculationAbilityBreakdown({
  section1,
}: {
  section1: AdtmReportData["sections"][0];
}) {
  const totalQuestions =
    (section1.correctCount || 0) +
    (section1.mistakeCount || 0) +
    (section1.unsolvedCount || 0);

  // Points from the example: Correct=90, Wrong=73, Blank=100
  // These might be based on question scores, but for display we use example values
  const correctPoints = 90;
  const wrongPoints = 73;
  const blankPoints = 100;

  const correctPercent =
    totalQuestions > 0
      ? ((section1.correctCount || 0) / totalQuestions) * 100
      : 0;
  const wrongPercent =
    totalQuestions > 0
      ? ((section1.mistakeCount || 0) / totalQuestions) * 100
      : 0;
  const blankPercent =
    totalQuestions > 0
      ? ((section1.unsolvedCount || 0) / totalQuestions) * 100
      : 0;

  const getPercentBadgeColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 60) return "bg-orange-500";
    return "bg-yellow-500";
  };

  return (
    <div className="border border-gray-300 p-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mr-2 text-sm font-bold">
          3
        </div>
        <h3 className="font-bold text-sm">Calculation Ability Score</h3>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2 text-left">Category</th>
            <th className="border border-gray-300 p-2 text-center">Count</th>
            <th className="border border-gray-300 p-2 text-center">Points</th>
            <th className="border border-gray-300 p-2 text-center">%</th>
          </tr>
        </thead>
        <tbody>
          {/* Correct - Light orange background */}
          <tr className="bg-orange-50">
            <td className="border border-gray-300 p-2">실수를 (Correct)</td>
            <td className="border border-gray-300 p-2 text-center">
              {section1.correctCount || 0}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              {correctPoints}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${getPercentBadgeColor(
                  correctPercent
                )} text-white font-bold text-xs`}
              >
                {correctPercent.toFixed(0)}
              </span>
            </td>
          </tr>
          {/* Wrong - Light blue background */}
          <tr className="bg-blue-50">
            <td className="border border-gray-300 p-2">정확도 (Wrong)</td>
            <td className="border border-gray-300 p-2 text-center">
              {section1.mistakeCount || 0}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              {wrongPoints}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${getPercentBadgeColor(
                  wrongPercent
                )} text-white font-bold text-xs`}
              >
                {wrongPercent.toFixed(0)}
              </span>
            </td>
          </tr>
          {/* Blank - Light green background */}
          <tr className="bg-green-50">
            <td className="border border-gray-300 p-2">속도 (Blank)</td>
            <td className="border border-gray-300 p-2 text-center">
              {section1.unsolvedCount || 0}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              {blankPoints}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${getPercentBadgeColor(
                  blankPercent
                )} text-white font-bold text-xs`}
              >
                {blankPercent.toFixed(0)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DifficultyScoreTable({
  difficulties,
}: {
  difficulties: Array<{
    difficulty: 1 | 2 | 3 | 4;
    fullMarks: number;
    rawScore: number;
    standardScore: number;
  }>;
}) {
  // Extend to 7 levels as per design (levels 5-7 may have empty points)
  const allLevels = [
    ...difficulties,
    // Add placeholder levels 5-7 if not present
    ...Array.from({ length: Math.max(0, 7 - difficulties.length) }, (_, i) => ({
      difficulty: (difficulties.length + i + 1) as 1 | 2 | 3 | 4,
      fullMarks: 0,
      rawScore: 0,
      standardScore: 0,
    })),
  ].slice(0, 7);

  return (
    <div className="border border-gray-300 p-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mr-2 text-sm font-bold">
          4
        </div>
        <h3 className="font-bold text-sm">Difficulty-Based Score</h3>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2 text-center">
              Difficulty Level
            </th>
            <th className="border border-gray-300 p-2 text-center">Points</th>
            <th className="border border-gray-300 p-2 text-center">Earned</th>
            <th className="border border-gray-300 p-2 text-center">
              Percentage
            </th>
          </tr>
        </thead>
        <tbody>
          {allLevels.map((diff, idx) => {
            const level = idx + 1;
            const percent = diff.fullMarks > 0 ? diff.standardScore : 0;
            const colorClass =
              percent >= 80
                ? "text-green-600"
                : percent >= 60
                ? "text-blue-600"
                : "text-red-600";

            return (
              <tr key={idx}>
                <td className="border border-gray-300 p-2 text-center">
                  {level}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {diff.fullMarks > 0 ? diff.fullMarks : ""}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {diff.rawScore}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {diff.fullMarks > 0 && percent > 0 ? (
                    <span className={`font-bold ${colorClass}`}>
                      {percent.toFixed(0)}
                    </span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConditionConcentrationChart({
  sections,
}: {
  sections: AdtmReportData["sections"];
}) {
  // Generate condition and concentration data based on section scores
  // Condition: Based on performance level (3 = good, 2 = fair, 1 = poor)
  // Concentration: Based on consistency across sections
  const chartData = sections.map((section, idx) => {
    const score = section.standardScore;
    let condition = 3;
    let concentration = 3;

    if (score >= 80) {
      condition = 3;
      concentration = 3;
    } else if (score >= 60) {
      condition = 2;
      concentration = 2;
    } else {
      condition = 1;
      concentration = 1;
    }

    // Adjust based on section number (as shown in original)
    if (idx >= 3) {
      condition = Math.max(1, condition - 1);
      concentration = Math.max(1, concentration - 1);
    }

    return {
      section: `Section${idx + 1}`,
      condition,
      concentration,
    };
  });

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">Condition & Concentration</h4>
      <div style={{ height: "150px", minHeight: "150px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={150}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="section" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="condition"
              stroke="rgba(234, 179, 8, 1)"
              strokeWidth={2}
              name="Condition"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="concentration"
              stroke="rgba(59, 130, 246, 1)"
              strokeWidth={2}
              name="Concentration"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CalculationDistributionChart({
  section1,
}: {
  section1: AdtmReportData["sections"][0];
}) {
  const chartData = [
    {
      name: "실수를",
      value: section1.correctCount || 0,
      color: "rgba(251, 146, 60, 0.8)", // Orange
    },
    {
      name: "정확도",
      value: section1.mistakeCount || 0,
      color: "rgba(59, 130, 246, 0.8)", // Blue
    },
    {
      name: "속도",
      value: section1.unsolvedCount || 0,
      color: "rgba(34, 197, 94, 0.8)", // Green
    },
  ];

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">
        Calculation Ability Distribution
      </h4>
      <div style={{ height: "120px", minHeight: "120px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={120}>
          <RechartsBarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              domain={[0, "dataMax"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              width={60}
            />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UnitBalanceRadar({
  chartData,
}: {
  chartData: AdtmReportData["charts"]["unitRadar"];
}) {
  const radarData = chartData.labels.map((label, index) => ({
    label,
    value: chartData.datasets[0]?.data[index] || 0,
  }));

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">Unit Balance</h4>
      <div style={{ height: "200px", minHeight: "200px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="rgba(59, 130, 246, 1)"
              fill="rgba(59, 130, 246, 0.2)"
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ScoringGuideBox() {
  return (
    <div className="border-2 border-orange-400 bg-orange-50 p-4 rounded">
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs mr-2 font-bold">
          i
        </div>
        <h4 className="font-bold">Scoring Guide</h4>
      </div>

      <div className="text-xs space-y-2">
        <div>
          <div className="font-semibold mb-1">1. Score by Domain</div>
          <p>
            The full score for each section is fixed at 100 points, and the
            combined total at the bottom will differ.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-1">2. Score Items</div>
          <p>
            These are the "Score" and "Standardized Score" items. Since the
            calculation is based on a 100-point full score, the scores and the
            standardized score will be the same. Only the overall evaluation at
            the bottom will differ.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-1">3. Score-Based Evaluation</div>
          <ul className="list-disc list-inside">
            <li>high (상-89): 80 points or higher → Green</li>
            <li>medium (중 60-79): 60 points or higher → Orange</li>
            <li>low (하 &lt;59): Below 60 points → Red</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DomainScoresChart({
  chartData,
}: {
  chartData: AdtmReportData["charts"]["sectionBar"];
}) {
  const barData = chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.datasets[0]?.data[index] || 0,
  }));

  const colors = [
    "rgba(59, 130, 246, 0.8)", // Blue - Section 1
    "rgba(6, 182, 212, 0.8)", // Cyan - Section 2
    "rgba(34, 197, 94, 0.8)", // Green - Section 3
    "rgba(251, 146, 60, 0.8)", // Orange - Section 4
    "rgba(234, 179, 8, 0.8)", // Yellow - Section 5
  ];

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">Domain Scores</h4>
      <div style={{ height: "200px", minHeight: "200px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsBarChart
            data={barData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DomainUnitChart({
  units,
}: {
  units: Array<{
    unitName: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
  }>;
}) {
  const chartData = units.map((unit) => ({
    name:
      unit.unitName.length > 10
        ? unit.unitName.substring(0, 10) + "..."
        : unit.unitName,
    value: unit.standardScore,
  }));

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">Domain - Unit Score</h4>
      <div style={{ height: "200px", minHeight: "200px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fill="rgba(59, 130, 246, 0.8)"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DomainDifficultyChart({
  difficulties,
}: {
  difficulties: Array<{
    difficulty: 1 | 2 | 3 | 4;
    fullMarks: number;
    rawScore: number;
    standardScore: number;
  }>;
}) {
  const chartData = difficulties.map((diff) => ({
    name: `Level ${diff.difficulty}`,
    value: diff.standardScore,
  }));

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">Domain - Difficulty Score</h4>
      <div style={{ height: "200px", minHeight: "200px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fill="rgba(234, 179, 8, 0.8)"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Other graphs are generated by retrieving the scores directly, not by
        calculation formulas.
      </p>
    </div>
  );
}
