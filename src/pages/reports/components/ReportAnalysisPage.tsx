import type { AdtmReportData } from "@/types/reports.types";
import {
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
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
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

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
      {/* Header - Match original */}
      <div className="flex items-center justify-center border-b-3 border-black pb-4 mb-6">
        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td
                className="text-right pr-4"
                style={{ verticalAlign: "middle" }}
              >
                <div className="text-red-600 text-4xl font-bold">able</div>
              </td>
              <td style={{ verticalAlign: "middle", textAlign: "left" }}>
                <span className="text-5xl font-serif font-bold">Analysis</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Row 1: Score by area (9 cols) + Student name (3 cols) */}
      <div
        className="row"
        style={{ display: "flex", flexWrap: "wrap", margin: "0" }}
      >
        <div className="col-xs-9" style={{ width: "75%", padding: "0 15px" }}>
          {/* 1. Score by area */}
          <Section1ScoreTable
            sections={sections}
            totalRawScore={totalRawScore}
            totalMaxScore={totalMaxScore}
            overallScore={overallScore}
            testCode={reportData.test.testCode}
          />
        </div>
        <div className="col-xs-3" style={{ width: "25%", padding: "0 15px" }}>
          <table className="table table-bordered table-condensed w-full">
            <tbody>
              <tr style={{ textAlign: "center", fontSize: "20px" }}>
                <td>Student name</td>
                <td style={{ fontWeight: "bold" }}>
                  {reportData.student.name}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Unit scores (6 cols) + Calculation (3 cols) + Difficulty (3 cols) */}
      <div
        className="row"
        style={{ display: "flex", flexWrap: "wrap", margin: "0" }}
      >
        <div className="col-xs-6" style={{ width: "50%", padding: "0 15px" }}>
          {/* 2. Unit-by-unit scores */}
          {sections[1]?.unitScores && sections[1].unitScores.length > 0 && (
            <Section2UnitTable
              units={sections[1].unitScores}
              section2Score={sections[1]?.standardScore}
              section3Score={sections[2]?.standardScore}
            />
          )}
        </div>
        <div className="col-xs-3" style={{ width: "25%", padding: "0 15px" }}>
          {/* 3. Calculation Competency Score */}
          {sections[0] && (
            <CalculationAbilityBreakdown section1={sections[0]} />
          )}
        </div>
        <div className="col-xs-3" style={{ width: "25%", padding: "0 15px" }}>
          {/* 4. Score by difficulty level */}
          {sections[0]?.difficultyBreakdown &&
            sections[0].difficultyBreakdown.length > 0 && (
              <DifficultyScoreTable
                difficulties={sections[0].difficultyBreakdown}
                section1Score={sections[0]?.standardScore}
                section2Score={sections[1]?.standardScore}
                section3Score={sections[2]?.standardScore}
              />
            )}
        </div>
      </div>

      {/* Row 3: Left charts (5 cols) + Right charts (7 cols) */}
      <div
        className="row"
        style={{ display: "flex", flexWrap: "wrap", margin: "0" }}
      >
        <div
          className="col-xs-5"
          style={{ width: "41.666%", padding: "0 15px" }}
        >
          {/* 5. Condition & Concentration Chart */}
          <div className="text-center mb-2">
            <span className="text-lg">Condition concentration</span>
          </div>
          <ConditionConcentrationChart sections={sections} />

          {/* 6. Calculation Ability Distribution */}
          <div className="text-center mb-2 mt-4">
            <span className="text-lg">Computational ability</span>
          </div>
          {sections[0] && (
            <CalculationDistributionChart section1={sections[0]} />
          )}

          {/* 7. Unit Balance Radar */}
          <div className="text-center mb-2 mt-4">
            <span className="text-lg">Balance by unit</span>
          </div>
          {charts?.unitRadar && (
            <UnitBalanceRadar chartData={charts.unitRadar} />
          )}
        </div>
        <div
          className="col-xs-7"
          style={{ width: "58.333%", padding: "0 15px" }}
        >
          {/* Scoring Guide Info Box */}
          <ScoringGuideBox />

          {/* 8. Domain Scores (Section Bar Chart) */}
          <div className="text-center mb-2 mt-4">
            <span className="text-lg">Score by area</span>
          </div>
          {charts?.sectionBar && (
            <DomainScoresChart chartData={charts.sectionBar} />
          )}

          {/* 9. Domain-Unit Scores */}
          <div className="text-center mb-2 mt-4">
            <span className="text-lg">Score by area and unit</span>
          </div>
          {sections[1]?.unitScores && sections[1].unitScores.length > 0 && (
            <DomainUnitChart units={sections[1].unitScores} />
          )}

          {/* 10. Domain-Difficulty Scores */}
          <div className="text-center mb-2 mt-4">
            <span className="text-lg">Score by Area - Difficulty</span>
          </div>
          {sections[0]?.difficultyBreakdown &&
            sections[0].difficultyBreakdown.length > 0 && (
              <DomainDifficultyChart
                difficulties={sections[0].difficultyBreakdown}
              />
            )}
        </div>
      </div>

      {/* Spacer for print */}
      <div className="col-xs-12" style={{ height: "95px" }}></div>
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
  // Calculate expected scores (placeholder - should come from backend)
  const expectedScores = [80, 65, 55, 40, 0];

  return (
    <div className="border border-gray-300 p-4">
      <div className="mb-3" style={{ margin: "20px 0px", padding: "0px" }}>
        <span className="text-xl">1. Score by area</span>
      </div>

      <table className="table table-bordered adtm-table w-full text-xs">
        <tbody>
          <tr>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              area
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Full marks
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Raw score
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              standard score
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Expected score
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              evaluation
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              concentration
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              condition
            </td>
          </tr>
          {sections.map((section, idx) => {
            const isSection4Or5 = idx >= 3;
            const displayFullScore = isSection4Or5 ? 40 : idx === 0 ? 103 : 100;
            const sectionNames = [
              "Computational ability",
              "Conceptual understanding ability",
              "Concept application ability",
              "Reasoning ability",
              "problem-solving skills",
            ];
            const sectionName = sectionNames[idx] || section.name;
            const evaluation =
              section.standardScore >= 80
                ? "award"
                : section.standardScore >= 60
                ? "award"
                : "award";

            return (
              <tr key={idx}>
                <td className="text-center border border-gray-300 p-2">
                  {sectionName}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {displayFullScore}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {section.rawScore}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {section.standardScore >= 80 ? (
                    <CheckCircle2
                      className="inline-block w-4 h-4 mr-1"
                      style={{ color: "#0f9d58" }}
                    />
                  ) : section.standardScore >= 60 ? (
                    <AlertCircle
                      className="inline-block w-4 h-4 mr-1"
                      style={{ color: "#f4b400" }}
                    />
                  ) : (
                    <XCircle
                      className="inline-block w-4 h-4 mr-1"
                      style={{ color: "#ed5a4e" }}
                    />
                  )}
                  {section.standardScore.toFixed(0)}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {expectedScores[idx] || 0}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {evaluation}
                </td>
                <td className="text-center border border-gray-300 p-2">0</td>
                <td className="text-center border border-gray-300 p-2">0</td>
              </tr>
            );
          })}
          <tr>
            <td className="text-center border border-gray-300 p-2">
              Math learning skills
            </td>
            <td className="text-center border border-gray-300 p-2">
              {totalMaxScore}
            </td>
            <td className="text-center border border-gray-300 p-2">
              {totalRawScore}
            </td>
            <td className="text-center border border-gray-300 p-2">
              {overallScore >= 80 ? (
                <CheckCircle2
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#0f9d58" }}
                />
              ) : overallScore >= 60 ? (
                <AlertCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#f4b400" }}
                />
              ) : (
                <XCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#ed5a4e" }}
                />
              )}
              {overallScore.toFixed(0)}
            </td>
            <td className="text-center border border-gray-300 p-2">0</td>
            <td className="text-center border border-gray-300 p-2">award</td>
            <td className="text-center border border-gray-300 p-2">0</td>
            <td className="text-center border border-gray-300 p-2">0</td>
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
  section2Score,
  section3Score,
}: {
  units: Array<{
    unitName: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
  }>;
  section2Score?: number;
  section3Score?: number;
}) {
  // Calculate understanding and application scores per unit
  // For now, we'll use standardScore for both (should come from backend)
  const totalUnderstanding = units.reduce(
    (sum, u) => sum + (u.standardScore * u.maxScore) / 100,
    0
  );
  const totalApplication = units.reduce(
    (sum, u) => sum + (u.standardScore * u.maxScore) / 100,
    0
  );
  const totalMax = units.reduce((sum, u) => sum + u.maxScore, 0);
  const totalStandard =
    totalMax > 0
      ? ((totalUnderstanding + totalApplication) / (totalMax * 2)) * 100
      : 0;

  return (
    <div className="border border-gray-300 p-4">
      <div className="mb-3" style={{ margin: "20px 0px", padding: "0px" }}>
        <span className="text-xl">2. Unit-by-unit scores</span>
      </div>

      <table className="table table-bordered adtm-table w-full text-xs">
        <tbody>
          <tr>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Unit
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Understanding the concept
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Concept application
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              standard score
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              evaluation
            </td>
          </tr>
          {units.map((unit, idx) => {
            // For each unit, we need understanding and application scores
            // Using standardScore as approximation (should come from backend)
            const understandingScore = unit.standardScore;
            const applicationScore = unit.standardScore;
            const avgScore = (understandingScore + applicationScore) / 2;

            return (
              <tr key={idx}>
                <td className="text-center border border-gray-300 p-2">
                  {idx + 1}. {unit.unitName}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {understandingScore.toFixed(2)}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {applicationScore.toFixed(2)}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {avgScore >= 80 ? (
                    <CheckCircle2
                      className="inline-block w-4 h-4 mr-1"
                      style={{ color: "#0f9d58" }}
                    />
                  ) : avgScore >= 60 ? (
                    <AlertCircle
                      className="inline-block w-4 h-4 mr-1"
                      style={{ color: "#f4b400" }}
                    />
                  ) : (
                    <XCircle
                      className="inline-block w-4 h-4 mr-1"
                      style={{ color: "#ed5a4e" }}
                    />
                  )}
                  {avgScore.toFixed(0)}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  award
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="text-center border border-gray-300 p-2">total</td>
            <td className="text-center border border-gray-300 p-2">
              {section2Score?.toFixed(0) || totalUnderstanding.toFixed(0)}
            </td>
            <td className="text-center border border-gray-300 p-2">
              {section3Score?.toFixed(0) || totalApplication.toFixed(0)}
            </td>
            <td className="text-center border border-gray-300 p-2">
              {totalStandard >= 80 ? (
                <CheckCircle2
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#0f9d58" }}
                />
              ) : totalStandard >= 60 ? (
                <AlertCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#f4b400" }}
                />
              ) : (
                <XCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#ed5a4e" }}
                />
              )}
              {totalStandard.toFixed(0)}
            </td>
            <td className="text-center border border-gray-300 p-2">award</td>
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
  // Calculate scores: speed (unsolved), Accuracy (correct), Error rate (mistake)
  // These are percentages
  const totalQuestions =
    (section1.correctCount || 0) +
    (section1.mistakeCount || 0) +
    (section1.unsolvedCount || 0);

  const speedScore =
    totalQuestions > 0
      ? ((section1.unsolvedCount || 0) / totalQuestions) * 100
      : 0;
  const accuracyScore =
    totalQuestions > 0
      ? ((section1.correctCount || 0) / totalQuestions) * 100
      : 0;
  const errorRate =
    totalQuestions > 0
      ? ((section1.mistakeCount || 0) / totalQuestions) * 100
      : 0;

  return (
    <div className="border border-gray-300 p-4">
      <div className="mb-3" style={{ margin: "20px 0px", padding: "0px" }}>
        <span className="text-xl">3. Calculation Competency Score</span>
      </div>

      <table className="table table-bordered adtm-table w-full text-xs">
        <tbody>
          <tr>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              division
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              score
            </td>
          </tr>
          <tr>
            <td className="text-center border border-gray-300 p-2">speed</td>
            <td className="text-center border border-gray-300 p-2">
              {speedScore >= 80 ? (
                <CheckCircle2
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#0f9d58" }}
                />
              ) : speedScore >= 60 ? (
                <AlertCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#f4b400" }}
                />
              ) : (
                <XCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#ed5a4e" }}
                />
              )}
              {speedScore.toFixed(0)}
            </td>
          </tr>
          <tr>
            <td className="text-center border border-gray-300 p-2">Accuracy</td>
            <td className="text-center border border-gray-300 p-2">
              {accuracyScore >= 80 ? (
                <CheckCircle2
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#0f9d58" }}
                />
              ) : accuracyScore >= 60 ? (
                <AlertCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#f4b400" }}
                />
              ) : (
                <XCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#ed5a4e" }}
                />
              )}
              {accuracyScore.toFixed(0)}
            </td>
          </tr>
          <tr>
            <td className="text-center border border-gray-300 p-2">
              Error rate
            </td>
            <td className="text-center border border-gray-300 p-2">
              {errorRate < 10 ? (
                <CheckCircle2
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#0f9d58" }}
                />
              ) : errorRate < 30 ? (
                <AlertCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#f4b400" }}
                />
              ) : (
                <XCircle
                  className="inline-block w-4 h-4 mr-1"
                  style={{ color: "#ed5a4e" }}
                />
              )}
              {errorRate.toFixed(0)}
            </td>
          </tr>
          <tr>
            <td className="text-center border border-gray-300 p-2">
              evaluation
            </td>
            <td className="text-center border border-gray-300 p-2">award</td>
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
  section1Score?: number;
  section2Score?: number;
  section3Score?: number;
}) {
  // Extend to 7 levels as per design
  const allLevels = [
    ...difficulties,
    ...Array.from({ length: Math.max(0, 7 - difficulties.length) }, (_, i) => ({
      difficulty: (difficulties.length + i + 1) as 1 | 2 | 3 | 4,
      fullMarks: 0,
      rawScore: 0,
      standardScore: 0,
    })),
  ].slice(0, 7);

  return (
    <div className="border border-gray-300 p-4">
      <div className="mb-3" style={{ margin: "20px 0px", padding: "0px" }}>
        <span className="text-xl">4. Score by difficulty level</span>
      </div>

      <table className="table table-bordered adtm-table w-full text-xs">
        <tbody>
          <tr>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              Difficulty
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              calculate
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              concept
            </td>
            <td
              className="text-center border border-gray-300"
              style={{
                fontWeight: "bold",
                height: "33px",
                backgroundColor: "rgb(245, 245, 246)",
                verticalAlign: "middle",
              }}
            >
              apply
            </td>
          </tr>
          {allLevels.map((diff, idx) => {
            const level = idx + 1;
            // Calculate scores: calculate (section 1), concept (section 2), apply (section 3)
            // For levels 1-3: show in calculate column
            // For level 3: show in concept column
            // For levels 4-5: show in concept column
            // For levels 5-7: show in apply column
            const calculateScore = level <= 3 ? diff.standardScore : 0;
            const conceptScore =
              level === 3
                ? 0
                : level >= 2 && level <= 5
                ? diff.standardScore
                : 0;
            const applyScore =
              level >= 5
                ? diff.standardScore
                : level === 3
                ? diff.standardScore
                : 0;

            return (
              <tr key={idx}>
                <td className="text-center border border-gray-300 p-2">
                  {level}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {calculateScore > 0 ? calculateScore.toFixed(0) : ""}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {conceptScore > 0 ? conceptScore.toFixed(0) : ""}
                </td>
                <td className="text-center border border-gray-300 p-2">
                  {applyScore > 0 ? applyScore.toFixed(0) : ""}
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
  // Map section labels to match original chart order and colors
  const sectionLabels = [
    "Calculation\nAbility",
    "Conceptual\nUnderstanding",
    "Conceptual\nApplication",
    "Reasoning\nAbility",
    "Problem-Solving\nAbility",
  ];

  const barData = chartData.labels.map((label, index) => ({
    name: sectionLabels[index] || label,
    value: chartData.datasets[0]?.data[index] || 0,
  }));

  // Exact colors from original chart reference
  const colors = [
    "#4674B9", // Dark blue - Calculation Ability
    "#62B8D2", // Teal/light blue - Conceptual Understanding
    "#96BFEF", // Lighter blue/periwinkle - Conceptual Application
    "#7C699E", // Dark purple/gray - Reasoning Ability
    "#95D16F", // Light green - Problem-Solving Ability
  ];

  return (
    <div className="border border-gray-300 p-4">
      <h4 className="font-bold mb-2 text-sm">Score by area</h4>
      <div style={{ height: "200px", minHeight: "200px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsBarChart
            data={barData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}`, "Score"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                style={{ fill: "#fff", fontSize: "11px", fontWeight: "normal" }}
                formatter={(value: any) => `${Number(value).toFixed(0)}`}
              />
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
