import type { AdtmReportData } from "@/types/reports.types";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
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
      className="bg-white p-8 print:p-8"
      style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}
    >
      {/* Row 1: Score by area (9 cols) + Student name (3 cols) */}
      <div
        className="row"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          margin: "0",
          alignItems: "flex-start",
        }}
      >
        <div
          className="col-xs-9"
          style={{ width: "75%", padding: "0 15px", flexShrink: 0 }}
        >
          {/* 1. Score by area */}
          <Section1ScoreTable
            sections={sections}
            totalRawScore={totalRawScore}
            totalMaxScore={totalMaxScore}
            overallScore={overallScore}
          />
        </div>
        <div
          className="col-xs-3"
          style={{
            width: "25%",
            padding: "0 15px",
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          {/* Spacer to align with "1. Score by area" title */}
          <div
            className="col-xs-12"
            style={{ margin: "20px 0px", padding: "0px", height: "20px" }}
          ></div>
          <table
            className="table table-bordered table-condensed w-full"
            style={{ border: "1px solid #000", marginTop: "0" }}
          >
            <tbody>
              <tr style={{ textAlign: "center", fontSize: "14px" }}>
                <td style={{ border: "1px solid #000" }}>Student name</td>
                <td style={{ fontWeight: "bold", border: "1px solid #000" }}>
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
        style={{
          display: "flex",
          flexWrap: "nowrap",
          margin: "0",
          width: "100%",
        }}
      >
        <div
          className="col-xs-6"
          style={{ width: "50%", padding: "0 10px", flexShrink: 0 }}
        >
          {/* 2. Unit-by-unit scores */}
          {sections[1]?.unitScores && sections[1].unitScores.length > 0 && (
            <Section2UnitTable
              units={sections[1].unitScores}
              section2Score={sections[1]?.standardScore}
              section3Score={sections[2]?.standardScore}
            />
          )}
        </div>
        <div
          className="col-xs-3"
          style={{ width: "25%", padding: "0 10px", flexShrink: 0 }}
        >
          {/* 3. Calculation Competency Score */}
          {sections[0] && (
            <CalculationAbilityBreakdown section1={sections[0]} />
          )}
        </div>
        <div
          className="col-xs-3"
          style={{ width: "25%", padding: "0 10px", flexShrink: 0 }}
        >
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
            <span style={{ fontSize: "14px" }}>Condition concentration</span>
          </div>
          {/* Legend above chart */}
          <div
            className="text-center mb-2"
            style={{ display: "flex", justifyContent: "center", gap: "15px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "30px",
                  height: "3px",
                  backgroundColor: "#f79646",
                }}
              />
              <span style={{ fontSize: "12px" }}>집중도,</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "30px",
                  height: "3px",
                  backgroundColor: "#8064a2",
                }}
              />
              <span style={{ fontSize: "12px" }}>컨디션,</span>
            </div>
          </div>
          <ConditionConcentrationChart sections={sections} />

          {/* 6. Calculation Ability Distribution */}
          <div className="text-center mb-2 mt-4">
            <span style={{ fontSize: "14px" }}>Computational ability</span>
          </div>
          {sections[0] && (
            <CalculationDistributionChart section1={sections[0]} />
          )}

          {/* 7. Unit Balance Radar */}
          <div className="text-center mb-2 mt-4">
            <span style={{ fontSize: "14px" }}>Balance by unit</span>
          </div>
          {charts?.unitRadar && (
            <UnitBalanceRadar chartData={charts.unitRadar} />
          )}
        </div>
        <div
          className="col-xs-7"
          style={{ width: "58.333%", padding: "0 15px" }}
        >
          {/* 8. Domain Scores (Section Bar Chart) */}
          <div className="text-center mb-2 mt-4">
            <span style={{ fontSize: "14px" }}>Score by area</span>
          </div>
          {charts?.sectionBar && (
            <DomainScoresChart chartData={charts.sectionBar} />
          )}

          {/* 9. Domain-Unit Scores */}
          <div className="text-center mb-2 mt-4">
            <span style={{ fontSize: "14px" }}>Score by area and unit</span>
          </div>
          {sections[1]?.unitScores && sections[1].unitScores.length > 0 && (
            <DomainUnitChart
              section2Units={sections[1].unitScores}
              section3Units={sections[2]?.unitScores || []}
            />
          )}

          {/* 10. Domain-Difficulty Scores */}
          <div className="text-center mb-2 mt-4">
            <span style={{ fontSize: "14px" }}>Score by Area - Difficulty</span>
          </div>
          {reportData.areaDifficulty &&
            reportData.areaDifficulty.length > 0 && (
              <DomainDifficultyChart
                areaDifficulty={reportData.areaDifficulty}
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
}: {
  sections: AdtmReportData["sections"];
  totalRawScore: number;
  totalMaxScore: number;
  overallScore: number;
}) {
  // Calculate expected scores (placeholder - should come from backend)
  const expectedScores = [80, 65, 55, 40, 0];

  return (
    <div>
      <div className="col-xs-12" style={{ margin: "20px 0px", padding: "0px" }}>
        <span style={{ fontSize: "14px" }}>1. Score by area</span>
      </div>

      <table
        className="table table-bordered adtm-table w-full"
        style={{ margin: 0 }}
      >
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
                ? "middle"
                : "under";

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
    <div>
      <div className="col-xs-12" style={{ margin: "20px 0px", padding: "0px" }}>
        <span style={{ fontSize: "14px" }}>2. Unit-by-unit scores</span>
      </div>

      <table
        className="table table-bordered adtm-table w-full"
        style={{ margin: 0 }}
      >
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
    <div>
      <div className="col-xs-12" style={{ margin: "20px 0px", padding: "0px" }}>
        <span style={{ fontSize: "14px" }}>
          3. Calculation Competency Score
        </span>
      </div>

      <table
        className="table table-bordered adtm-table w-full"
        style={{ margin: 0 }}
      >
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
    <div>
      <div className="col-xs-12" style={{ margin: "20px 0px", padding: "0px" }}>
        <span style={{ fontSize: "14px" }}>4. Score by difficulty level</span>
      </div>

      <table
        className="table table-bordered adtm-table w-full"
        style={{ margin: 0 }}
      >
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
    <div>
      <div style={{ height: "150px", minHeight: "150px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={150}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="section" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[0, 5]}
              tick={{ fontSize: 10 }}
              tickCount={6}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="condition"
              stroke="#8064a2"
              strokeWidth={3}
              name="컨디션,"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="concentration"
              stroke="#f79646"
              strokeWidth={3}
              name="집중도,"
              dot={false}
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
  // Calculate error rate, accuracy, and speed scores
  const totalQuestions =
    (section1.correctCount || 0) +
    (section1.mistakeCount || 0) +
    (section1.unsolvedCount || 0);

  const errorRate =
    totalQuestions > 0
      ? ((section1.mistakeCount || 0) / totalQuestions) * 100
      : 0;
  const accuracy =
    totalQuestions > 0
      ? ((section1.correctCount || 0) / totalQuestions) * 100
      : 0;
  const speed =
    totalQuestions > 0
      ? ((section1.unsolvedCount || 0) / totalQuestions) * 100
      : 0;

  // Colors from original design
  const errorRateColor = "rgb(247, 150, 70)"; // Orange - 실수율
  const accuracyColor = "rgb(79, 129, 189)"; // Blue - 정확도
  const speedColor = "rgb(155, 187, 89)"; // Green - 속도

  const chartData = [
    {
      name: "실수율", // Error rate
      value: errorRate,
      color: errorRateColor,
    },
    {
      name: "정확도", // Accuracy
      value: accuracy,
      color: accuracyColor,
    },
    {
      name: "속도", // Speed
      value: speed,
      color: speedColor,
    },
  ];

  return (
    <div>
      <div style={{ height: "150px", minHeight: "150px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={150}>
          <RechartsBarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 16 }}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(0)}`, "Score"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
              }}
            />
            <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="#fff"
                      fontSize="13px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
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

  // Colors from original design - blue radar chart
  const radarFillColor = "rgba(79, 129, 189, 0.2)"; // Light blue fill
  const radarStrokeColor = "rgb(79, 129, 189)"; // Darker blue stroke

  return (
    <div>
      <div style={{ height: "250px", minHeight: "250px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <RadarChart
            data={radarData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              tickFormatter={(value: string) => {
                // Format label: if it's a number, show as "1.분수의 나눗셈" format
                return value;
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#666" }}
              tickCount={5}
              tickFormatter={(value: number) => {
                // Show specific ticks: 0, 25, 50, 75, 100
                if ([0, 25, 50, 75, 100].includes(value)) {
                  return value.toString();
                }
                return "";
              }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={radarStrokeColor}
              fill={radarFillColor}
              strokeWidth={3}
              dot={{ fill: radarStrokeColor, r: 4 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}`, "Score"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DomainScoresChart({
  chartData,
}: {
  chartData: AdtmReportData["charts"]["sectionBar"];
}) {
  // Map section labels to match original chart - Korean labels, horizontal
  const sectionLabels = [
    "계산 능력",
    "개념 이해 능력",
    "개념 적용 능력",
    "추론 능력",
    "문제 해결 능력",
    "수학 학습 역량",
  ];

  const barData = chartData.labels.map((label, index) => ({
    name: sectionLabels[index] || label,
    value: chartData.datasets[0]?.data[index] || 0,
    textColor: index === chartData.labels.length - 1 ? "#000" : "#fff", // Black for last bar (yellow), white for others (blue)
  }));

  // Two colors from original design: blue and yellow
  const blueColor = "rgb(79, 129, 189)"; // #4f81bd
  const yellowColor = "rgb(255, 192, 0)"; // #ffc000

  // First 5 bars are blue, last bar (Mathematics Learning Competency) is yellow
  const getBarColor = (index: number, total: number) => {
    if (index === total - 1) {
      return yellowColor; // Last bar is yellow
    }
    return blueColor; // All other bars are blue
  };

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "20px",
          marginBottom: "10px",
          paddingRight: "30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: "rgb(161, 197, 102)",
            }}
          />
          <span style={{ fontSize: "12px" }}>예상점수</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: "rgb(79, 129, 189)",
            }}
          />
          <span style={{ fontSize: "12px" }}>학생점수</span>
        </div>
      </div>

      <div style={{ height: "150px", minHeight: "150px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsBarChart
            data={barData}
            margin={{ top: 5, right: 30, left: 0, bottom: 40 }}
            barCategoryGap="20%"
            barGap={10}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={0}
              textAnchor="middle"
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
            <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={20}>
              {barData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(index, barData.length)}
                />
              ))}
              <LabelList
                dataKey="value"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value, index } = props;
                  const dataPoint = barData[index];
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill={dataPoint?.textColor || "#fff"}
                      fontSize="11px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DomainUnitChart({
  section2Units,
  section3Units,
}: {
  section2Units: Array<{
    unitName: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
  }>;
  section3Units: Array<{
    unitName: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
  }>;
}) {
  // Create a map of all unique unit names
  const allUnitNames = new Set<string>();
  section2Units.forEach((unit) => allUnitNames.add(unit.unitName));
  section3Units.forEach((unit) => allUnitNames.add(unit.unitName));

  // Create a map for quick lookup
  const section2Map = new Map(
    section2Units.map((unit) => [unit.unitName, unit])
  );
  const section3Map = new Map(
    section3Units.map((unit) => [unit.unitName, unit])
  );

  // Build chart data with both scores for each unit
  const chartData = Array.from(allUnitNames).map((unitName) => {
    const section2Unit = section2Map.get(unitName);
    const section3Unit = section3Map.get(unitName);

    return {
      name: unitName.length > 15 ? unitName.substring(0, 15) + "..." : unitName,
      fullName: unitName,
      개념이해: section2Unit?.standardScore || 0,
      개념응용: section3Unit?.standardScore || 0,
    };
  });

  // Colors from original design
  const understandingColor = "rgb(255, 192, 0)"; // Yellow/Orange
  const applicationColor = "rgb(75, 172, 198)"; // Teal-blue

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "20px",
          marginBottom: "10px",
          paddingRight: "30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: applicationColor,
            }}
          />
          <span style={{ fontSize: "12px" }}>개념응용</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: understandingColor,
            }}
          />
          <span style={{ fontSize: "12px" }}>개념이해</span>
        </div>
      </div>

      <div style={{ height: "250px", minHeight: "250px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 40 }}
            barCategoryGap="20%"
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9 }}
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}`,
                name === "개념이해"
                  ? "Concept Understanding"
                  : "Concept Application",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
              }}
            />
            <Bar
              dataKey="개념응용"
              radius={[0, 0, 0, 0]}
              barSize={20}
              fill={applicationColor}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-application-${index}`}
                  fill={applicationColor}
                />
              ))}
              <LabelList
                dataKey="개념응용"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="#fff"
                      fontSize="11px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar
              dataKey="개념이해"
              radius={[0, 0, 0, 0]}
              barSize={20}
              fill={understandingColor}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-understanding-${index}`}
                  fill={understandingColor}
                />
              ))}
              <LabelList
                dataKey="개념이해"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="#000"
                      fontSize="11px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DomainDifficultyChart({
  areaDifficulty,
}: {
  areaDifficulty: Array<{
    area: string;
    적용: number;
    개념: number;
    계산: number;
  }>;
}) {
  // Colors from original design
  const applicationColor = "rgb(79, 129, 189)"; // Dark blue - 적용
  const calculationColor = "rgb(147, 205, 221)"; // Light blue - 계산
  const conceptColor = "rgb(247, 150, 70)"; // Orange - 개념

  // Use data directly from backend
  const chartData = areaDifficulty.map((data) => ({
    name: data.area,
    적용: data.적용,
    개념: data.개념,
    계산: data.계산,
  }));

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: applicationColor,
            }}
          />
          <span style={{ fontSize: "12px" }}>적용</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: conceptColor,
            }}
          />
          <span style={{ fontSize: "12px" }}>개념</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: calculationColor,
            }}
          />
          <span style={{ fontSize: "12px" }}>계산</span>
        </div>
      </div>

      <div style={{ height: "250px", minHeight: "250px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 40 }}
            barCategoryGap="20%"
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}`,
                name === "적용"
                  ? "Application"
                  : name === "개념"
                  ? "Concept"
                  : "Calculation",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
              }}
            />
            <Bar
              dataKey="적용"
              radius={[0, 0, 0, 0]}
              barSize={20}
              fill={applicationColor}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-application-${index}`}
                  fill={applicationColor}
                />
              ))}
              <LabelList
                dataKey="적용"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="#fff"
                      fontSize="11px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar
              dataKey="개념"
              radius={[0, 0, 0, 0]}
              barSize={20}
              fill={conceptColor}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-concept-${index}`} fill={conceptColor} />
              ))}
              <LabelList
                dataKey="개념"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="#fff"
                      fontSize="11px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar
              dataKey="계산"
              radius={[0, 0, 0, 0]}
              barSize={20}
              fill={calculationColor}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-calculation-${index}`}
                  fill={calculationColor}
                />
              ))}
              <LabelList
                dataKey="계산"
                position="inside"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="#fff"
                      fontSize="11px"
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Number(value).toFixed(0)}
                    </text>
                  );
                }}
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
