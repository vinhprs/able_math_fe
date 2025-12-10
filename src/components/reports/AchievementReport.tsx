import { ReportBarChart } from "@/components/charts/ReportBarChart";
import { cn } from "@/lib/cn";
import type { AchievementReportData } from "@/types/reports.types";

interface AchievementReportProps {
  reportData: AchievementReportData;
}

/**
 * Calculate predicted grade based on standard score
 * A: >90%, B: 80-90%, C: 70-80%, D: 60-70%, AND: <60%
 */
function getPredictedGrade(standardScore: number): string {
  if (standardScore >= 90) return "A";
  if (standardScore >= 80) return "B";
  if (standardScore >= 70) return "C";
  if (standardScore >= 60) return "D";
  return "AND";
}

/**
 * Calculate unit rating (letter grade) based on standard score
 */
function getUnitRating(standardScore: number): string {
  if (standardScore >= 90) return "A";
  if (standardScore >= 80) return "B";
  if (standardScore >= 70) return "C";
  if (standardScore >= 60) return "D";
  return "AND";
}

/**
 * Format test code for display
 * Example: "M11-T1-L2-01(2015).PDF"
 */
function formatTestCode(test: AchievementReportData["test"]): string {
  const { code } = test;
  return `${code}(2015).PDF`;
}

export function AchievementReport({ reportData }: AchievementReportProps) {
  // Guard against undefined/missing data
  if (
    !reportData ||
    !reportData.student ||
    !reportData.test ||
    !reportData.scores
  ) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Report data is not available. Please try again later.</p>
      </div>
    );
  }

  const predictedGrade = getPredictedGrade(reportData.scores.standardScore);
  // Ensure nationalAverage and maxScore are numbers
  const nationalAverage =
    typeof reportData.test.nationalAverage === "number"
      ? reportData.test.nationalAverage
      : Number(reportData.test.nationalAverage) || 0;
  const maxScore =
    typeof reportData.test.maxScore === "number"
      ? reportData.test.maxScore
      : Number(reportData.test.maxScore) || 100;

  // Prepare unit bar chart data - Note: legend order is 내점수, 최고점, 평균 (from SVG)
  const unitBarChartData = {
    type: "bar" as const,
    labels: reportData.unitScores.map((u) => u.unitNameEnglish || u.unitName),
    datasets: [
      {
        label: "내점수",
        data: reportData.unitScores.map((u) => u.standardScore),
        backgroundColor: "#88b5de", // Blue
      },
      {
        label: "최고점",
        data: reportData.unitScores.map(() => maxScore),
        backgroundColor: "#f2a46e", // Orange
      },
      {
        label: "평균",
        data: reportData.unitScores.map(() => nationalAverage),
        backgroundColor: "#c0c0c0", // Grey
      },
    ],
  };

  return (
    <div
      className="bg-white report-container"
      style={{
        paddingLeft: "15px",
        paddingRight: "15px",
        paddingBottom: "25px",
        fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif',
        fontSize: "13px",
        color: "#676a6c",
        lineHeight: "1.42857143",
      }}
    >
      <div style={{ width: "1000px", margin: "0px auto" }}>
        {/* Red Banner Header - SVG exact match */}
        <div style={{ paddingTop: "15px" }}>
          <svg width="100%" height="200px">
            <rect
              width="100%"
              height="100%"
              style={{ fill: "#C00000", strokeWidth: 3, stroke: "#C00000" }}
            />
            <text
              x="80"
              y="60"
              fill="#ffffff"
              style={{
                fontSize: "40px",
                color: "#ffffff",
                fontFamily: "'century gothic', sans-serif",
              }}
            >
              able
            </text>
            <text
              x="180"
              y="60"
              fill="#ffffff"
              style={{ fontSize: "30px", color: "#ffffff" }}
            >
              등급유지테스트
            </text>
            <text
              x="120"
              y="150"
              fill="#ffffff"
              style={{ fontSize: "35px", color: "#ffffff" }}
            >
              결과분석표
            </text>
            <text
              x="710"
              y="160"
              fill="#ffffff"
              textAnchor="start"
              style={{ fontSize: "19px", color: "#ffffff" }}
            >
              {reportData.test.grade} {reportData.test.semester}학기{" "}
              {reportData.test.examType === "MIDTERM" ? "중간" : "기말"} L
              {reportData.test.level} {reportData.test.testNumber || "1"}
            </text>
            <text
              x="710"
              y="180"
              fill="#ffffff"
              textAnchor="start"
              style={{ fontSize: "20px", color: "#ffffff" }}
            >
              {formatTestCode(reportData.test)}
            </text>
          </svg>
        </div>

        {/* Section 1: 등급유지테스트란? */}
        <div style={{ margin: "10px 0px 30px 0px" }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "25%",
                paddingLeft: "0px",
                flexShrink: 0,
                marginRight: "20px",
              }}
            >
              <svg width="100%" height="25px">
                <rect
                  width="100%"
                  height="100%"
                  style={{ fill: "#C00000", strokeWidth: 3, stroke: "#C00000" }}
                />
                <text
                  x="10"
                  y="18"
                  fill="#ffffff"
                  style={{ fontSize: "15px", color: "#ffffff" }}
                >
                  등급유지테스트란?
                </text>
              </svg>
            </div>
            <div style={{ width: "75%", paddingRight: "0px" }}>
              <p style={{ margin: 0, color: "rgb(68, 84, 106)" }}>
                Able believes that timely review is crucial. In this regard, a
                grade maintenance test is administered at the end of each
                half-semester course, with each unit receiving a grade for that
                unit. If a student fails to achieve a grade, appropriate
                feedback is provided to address any weaknesses. A retest is
                conducted and students must pass the final exam to receive a
                grade. To ensure thorough review, the questions are designed to
                be more difficult than those used in school exams (equivalent to
                those used in school competitions).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: 테스트 난이도는? */}
        <div style={{ margin: "30px 0px" }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "25%",
                paddingLeft: "0px",
                flexShrink: 0,
                marginRight: "20px",
              }}
            >
              <svg width="100%" height="25px">
                <rect
                  width="100%"
                  height="100%"
                  style={{ fill: "#C00000", strokeWidth: 3, stroke: "#C00000" }}
                />
                <text
                  x="10"
                  y="18"
                  fill="#ffffff"
                  style={{ fontSize: "15px", color: "#ffffff" }}
                >
                  테스트 난이도는?
                </text>
              </svg>
            </div>
            <div style={{ width: "75%", paddingRight: "0px" }}>
              <table
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 0,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <td style={{ width: "40%", padding: "12px 8px" }}>
                      Difficulty
                    </td>
                    <td
                      style={{
                        width: "15%",
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                    >
                      Best
                    </td>
                    <td
                      style={{
                        width: "15%",
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                    >
                      award
                    </td>
                    <td
                      style={{
                        width: "15%",
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                    >
                      middle
                    </td>
                    <td
                      style={{
                        width: "15%",
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                    >
                      under
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>School unit test</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      5%
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      5~10%
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      60%
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      30%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>
                      Able Grade Maintenance Test
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      40%
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      40%
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      20%
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: 성취평가제 기준은? */}
        <div style={{ margin: "30px 0px" }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "25%",
                paddingLeft: "0px",
                flexShrink: 0,
                marginRight: "20px",
              }}
            >
              <svg width="100%" height="25px">
                <rect
                  width="100%"
                  height="100%"
                  style={{ fill: "#C00000", strokeWidth: 3, stroke: "#C00000" }}
                />
                <text
                  x="10"
                  y="18"
                  fill="#ffffff"
                  style={{ fontSize: "15px", color: "#ffffff" }}
                >
                  성취평가제 기준은?
                </text>
              </svg>
            </div>
            <div style={{ width: "75%", paddingRight: "0px" }}>
              <table
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 0,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <td style={{ width: "16.67%", padding: "12px 8px" }}>
                      Achievement
                    </td>
                    <td style={{ width: "33.33%", padding: "12px 8px" }}>
                      Standard achievement rate
                    </td>
                    <td style={{ padding: "12px 8px" }}>definition</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>A</td>
                    <td style={{ padding: "12px 8px" }}>More than 90%</td>
                    <td style={{ padding: "12px 8px", fontSize: "9px" }}>
                      Very good level of understanding and performance of
                      learning content
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>B</td>
                    <td style={{ padding: "12px 8px" }}>80%~90%</td>
                    <td style={{ padding: "12px 8px", fontSize: "9px" }}>
                      Excellent level of understanding and performance of
                      learning content
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>C</td>
                    <td style={{ padding: "12px 8px" }}>70%~80%</td>
                    <td style={{ padding: "12px 8px", fontSize: "9px" }}>
                      Average level of understanding and performance of learning
                      content
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>D</td>
                    <td style={{ padding: "12px 8px" }}>60%~70%</td>
                    <td style={{ padding: "12px 8px", fontSize: "9px" }}>
                      A level where understanding and performance of learning
                      content is somewhat insufficient
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 8px" }}>AND</td>
                    <td style={{ padding: "12px 8px" }}>less than 60%</td>
                    <td style={{ padding: "12px 8px", fontSize: "9px" }}>
                      Insufficient level of understanding and performance of
                      learning content
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Summary Banner - SVG exact match */}
        <div>
          <svg width="100%" height="150px">
            <rect
              width="100%"
              height="100%"
              style={{
                fill: "RGB(68,84,106)",
                strokeWidth: 3,
                stroke: "RGB(68,84,106)",
              }}
            />
            <text
              x="180"
              y="70"
              fill="#ffffff"
              textAnchor="middle"
              style={{ fontSize: "40px", color: "#ffffff" }}
            >
              {reportData.student.name}
            </text>
            <text
              x="180"
              y="115"
              fill="#ffffff"
              textAnchor="middle"
              style={{ fontSize: "20px", color: "#ffffff" }}
            >
              학교성취평가 예상등급
            </text>
            <text
              x="500"
              y="110"
              fill="#ffffff"
              textAnchor="middle"
              style={{ fontSize: "90px", color: "#ffffff" }}
            >
              {predictedGrade}
            </text>

            {/* Score box */}
            <rect
              x="650"
              y="30"
              width="280"
              height="60"
              style={{ fill: "#ffffff", strokeWidth: 3, stroke: "#ffffff" }}
            />
            <rect
              x="651"
              y="32"
              width="70"
              height="56"
              style={{
                fill: "RGB(68,84,106)",
                strokeWidth: 3,
                stroke: "RGB(68,84,106)",
              }}
            />
            <text
              x="666"
              y="70"
              fill="#ffffff"
              textAnchor="start"
              style={{ fontSize: "20px", color: "#ffffff" }}
            >
              점수
            </text>
            <text
              x="823"
              y="75"
              fill="RGB(68,84,106)"
              textAnchor="middle"
              style={{ fontSize: "35px" }}
            >
              {reportData.scores.standardScore.toFixed(0)}
            </text>

            <text
              x="850"
              y="108"
              fill="#ffffff"
              textAnchor="end"
              style={{ fontSize: "15px", color: "#ffffff" }}
            >
              응시자 평균
            </text>
            <text
              x="850"
              y="128"
              fill="#ffffff"
              textAnchor="end"
              style={{ fontSize: "15px", color: "#ffffff" }}
            >
              {Number(nationalAverage).toFixed(0)}
            </text>
            <text
              x="930"
              y="108"
              fill="#ffffff"
              textAnchor="end"
              style={{ fontSize: "15px", color: "#ffffff" }}
            >
              최고 점수
            </text>
            <text
              x="930"
              y="128"
              fill="#ffffff"
              textAnchor="end"
              style={{ fontSize: "15px", color: "#ffffff" }}
            >
              {Number(maxScore)}
            </text>
          </svg>
        </div>

        {/* Unit Performance Table */}
        <div>
          <table
            className="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 0,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9f9f9" }}>
                <td style={{ padding: "12px" }}>Unit</td>
                <td style={{ padding: "12px" }}>rating</td>
                <td style={{ padding: "12px" }}>score</td>
                <td style={{ padding: "12px" }}>average</td>
                <td style={{ padding: "12px" }}>Highest score</td>
              </tr>
            </thead>
            <tbody>
              {reportData.unitScores.map((unit, index) => {
                const rating = getUnitRating(unit.standardScore);
                // Use English name if available, otherwise use Korean name (cleaned)
                const displayName =
                  unit.unitNameEnglish ||
                  unit.unitName.replace(/^\d+\.\s*\d*\.?\s*/, "");
                return (
                  <tr key={unit.unitName}>
                    <td style={{ padding: "12px" }}>
                      {index + 1}. {displayName}
                    </td>
                    <td style={{ padding: "12px" }}>{rating}</td>
                    <td style={{ padding: "12px" }}>
                      {unit.standardScore.toFixed(0)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {Number(nationalAverage).toFixed(0)}
                    </td>
                    <td style={{ padding: "12px" }}>{Number(maxScore)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        <div style={{ marginBottom: "20px" }}>
          <ReportBarChart
            title=""
            data={unitBarChartData}
            height={230}
            color="#88b5de"
          />
        </div>

        {/* Problem Details Table */}
        {reportData.questionBreakdown.length > 0 && (
          <table
            className="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 0,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9f9f9" }}>
                <td style={{ padding: "8px" }}>Problem number</td>
                <td style={{ padding: "8px" }}>Problem type</td>
                <td style={{ padding: "8px" }}>Correct answer</td>
                <td style={{ padding: "8px" }}>Entered value</td>
              </tr>
            </thead>
            <tbody>
              {reportData.questionBreakdown.map((q) => {
                const isIncorrect = !q.isCorrect;
                return (
                  <tr
                    key={q.questionNumber}
                    className={cn(isIncorrect && "bg-danger")}
                    style={
                      isIncorrect ? { backgroundColor: "#f2dede" } : undefined
                    }
                  >
                    <td style={{ padding: "8px" }}>{q.questionNumber}</td>
                    <td style={{ padding: "8px" }}>{q.questionType}</td>
                    <td style={{ padding: "8px" }}>{q.correctAnswer}</td>
                    <td style={{ padding: "8px" }}>{q.enteredValue || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Footer spacing */}
        <div style={{ height: "50px" }}></div>
      </div>
    </div>
  );
}
