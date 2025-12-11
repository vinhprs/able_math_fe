import type { AdtmReportData } from "@/types/reports.types";
import {
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReportCoverPageProps {
  studentName: string;
  testCode: string;
  sections: AdtmReportData["sections"];
  overallScore: number;
}

export function ReportCoverPage({
  studentName,
  testCode,
  sections,
  overallScore,
}: ReportCoverPageProps) {
  // Prepare chart data matching original design with exact colors from reference
  // Note: For vertical bars, names should be shorter or use Korean labels
  const chartData = [
    {
      name: "계산능력", // Calculation Ability
      value: sections[0]?.standardScore || 0,
      color: "#4674B9", // Dark blue - matches original
    },
    {
      name: "개념이해능력", // Conceptual Understanding
      value: sections[1]?.standardScore || 0,
      color: "#62B8D2", // Teal/light blue - matches original
    },
    {
      name: "개념적용능력", // Conceptual Application
      value: sections[2]?.standardScore || 0,
      color: "#96BFEF", // Lighter blue/periwinkle - matches original
    },
    {
      name: "추론능력", // Reasoning Ability
      value: sections[3]?.standardScore || 0,
      color: "#7C699E", // Dark purple/gray - matches original
    },
    {
      name: "문제해결능력", // Problem-Solving Ability
      value: sections[4]?.standardScore || 0,
      color: "#95D16F", // Light green - matches original
    },
    {
      name: "수학학습역량", // Mathematics Learning Competency
      value: overallScore,
      color: "#F8C857", // Yellow/orange - matches original
    },
  ];

  return (
    <div
      className="bg-white p-8 min-h-screen print:p-8 report-page-1"
      style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}
    >
      {/* Header - Match original layout */}
      <div
        className="col-xs-12 text-center mb-8"
        style={{ padding: "20px 0px", borderBottom: "3px solid" }}
      >
        <table style={{ width: "50%", margin: "0 auto" }}>
          <tbody>
            <tr>
              <td
                className="col-xs-6"
                style={{
                  verticalAlign: "middle",
                  textAlign: "right",
                  width: "auto",
                  paddingRight: "4px",
                }}
              >
                {/* Logo only - no text next to it */}
                <img
                  src="/able_adtm_logo.png"
                  alt="Able Logo"
                  style={{ width: "300px" }}
                  onError={(e) => {
                    // Fallback to text if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".logo-fallback")) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "logo-fallback text-red-600 text-4xl font-bold";
                      fallback.textContent = "able";
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </td>
              <td
                style={{
                  verticalAlign: "middle",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "70px",
                    fontFamily: "serif",
                    fontWeight: "bold",
                    color: "rgb(103, 106, 108)",
                  }}
                >
                  Report
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Introductory text - Match original */}
      <div
        className="mb-8 text-sm leading-relaxed"
        style={{ padding: "15px 10px", fontSize: "13px" }}
      >
        <p>
          This diagnostic test is designed to diagnose students' learning status
          and learning methods in mathematics.
        </p>
        <p>
          It was jointly developed by Able Edutech Co., Ltd., the Mathematics
          Island Mathematics Research Institute, Professor Jeong Cheol-hee's
          Daechi-dong Research Institute, and the Cognitive Science Research
          Institute of Seoul National University.
        </p>
        <br />
        <p>
          This assessment consists of five areas designed to more accurately
          assess a learner's mathematical thinking skills. It assesses the
          learner's readiness for learning and determines the starting point for
          future teaching strategies and progress.
        </p>
      </div>

      {/* Section Descriptions - Match original table format */}
      <div className="col-xs-12 mb-8">
        <div className="col-xs-12" style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "20px" }}>
            1. Comprehensive Mathematical Thinking Ability Diagnostic Test
          </span>
        </div>

        <table
          className="table table-bordered"
          style={{ border: "1px solid #000" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "17px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 1 - COMPUTATIONAL ABILITY
                </span>
              </td>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "13px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                It assesses the ability to simplify a given equation by applying
                the basic laws or properties of operations, and the ability to
                apply basic formulas or calculation methods.
              </td>
            </tr>
            <tr>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "17px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 2 - Conceptual Understanding Ability
                </span>
              </td>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "13px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                Assess the level of understanding of the meaning and properties
                of mathematical terms, symbols, formulas, graphs, and tables
                given in the problem.
              </td>
            </tr>
            <tr>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "17px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 3 - Concept Application Ability
                </span>
              </td>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "13px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                It assesses the ability to understand and apply mathematical
                concepts related to a given problem, the ability to express a
                given problem situation mathematically, and the ability to
                rephrase a mathematical expression into another expression.
              </td>
            </tr>
            <tr>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "17px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 4 - Reasoning Abilities
                </span>
              </td>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "13px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                It assesses the ability to discover the core principles of
                problem solving through listing, counting, and observation; the
                ability to discover the core principles of problem solving
                through analogy; the ability to derive true properties or
                determine the truth or falsity of a given proposition using
                mathematical concepts, principles, and laws; the ability to
                understand a given definition and derive true properties; the
                ability to understand proofs and the ability to read proofs and
                draw conclusions.
              </td>
            </tr>
            <tr>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "17px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 5 - PROBLEM-SOLVING SKILLS
                </span>
              </td>
              <td
                style={{
                  verticalAlign: "middle",
                  fontSize: "13px",
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                It assesses the ability to solve problems by understanding and
                synthesizing the relationship between two or more mathematical
                concepts, principles, and laws, the ability to solve problems
                through a two-step or more thought process, and the ability to
                solve problems by applying related mathematical concepts in
                real-life situations.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Overall Evaluation Chart - Match original format */}
      <div className="mb-8" style={{ marginTop: "30px" }}>
        <div className="col-xs-12" style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "20px" }}>
            <span>2. </span>
            <span style={{ fontSize: "25px", fontWeight: "bold" }}>
              {studentName}&nbsp;
            </span>
            <span>Student's Diagnostic Test Results - </span>
            <span
              style={{
                fontSize: "25px",
                fontWeight: "bold",
                color: "#cc0000",
              }}
            >
              [{testCode}]&nbsp;
            </span>
          </span>
        </div>
        <div className="col-xs-12 text-center mb-4">
          <span style={{ fontSize: "20px" }}>
            Able Math Ability Diagnostic Test Results
          </span>
        </div>

        {/* Legend - Match original design */}
        <div
          className="col-xs-12 text-center mb-2"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          {chartData.map((entry, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "3px",
                  backgroundColor: entry.color,
                }}
              />
              <span style={{ fontSize: "12px" }}>{entry.name}</span>
            </div>
          ))}
        </div>

        {/* Vertical Bar Chart */}
        <div
          className="col-xs-12"
          style={{ height: "550px", minHeight: "550px", width: "100%" }}
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={550}>
            <RechartsBarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              barCategoryGap="20%"
              barGap={10}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickCount={6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
              />
              <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{
                    fill: "#000",
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                  formatter={(value: any) => `${Number(value).toFixed(0)}`}
                />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Header - Match original design */}
        <div
          className="col-xs-12 text-center"
          style={{
            padding: "20px 0px",
            borderBottom: "3px solid",
            marginTop: "10px",
          }}
        >
          <table style={{ width: "40%", margin: "0 auto" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    verticalAlign: "middle",
                    textAlign: "right",
                    width: "auto",
                    paddingRight: "10px",
                  }}
                >
                  {/* Logo */}
                  <img
                    src="/able_adtm_logo.png"
                    alt="Able Logo"
                    style={{ width: "250px" }}
                    onError={(e) => {
                      // Fallback to text if image not found
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".logo-fallback")) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "logo-fallback text-red-600 text-4xl font-bold";
                        fallback.textContent = "able";
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </td>
                <td
                  style={{
                    verticalAlign: "middle",
                    textAlign: "left",
                    width: "auto",
                    paddingLeft: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "50px",
                      fontFamily: "serif",
                      fontWeight: "bold",
                      color: "rgb(103, 106, 108)",
                    }}
                  >
                    Analysis
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
