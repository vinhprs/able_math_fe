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
  testCode,
  sections,
  overallScore,
}: ReportCoverPageProps) {
  // Prepare chart data matching original design with exact colors from reference
  const chartData = [
    {
      name: "Calculation\nAbility",
      value: sections[0]?.standardScore || 0,
      color: "#4674B9", // Dark blue - matches original
    },
    {
      name: "Conceptual\nUnderstanding",
      value: sections[1]?.standardScore || 0,
      color: "#62B8D2", // Teal/light blue - matches original
    },
    {
      name: "Conceptual\nApplication",
      value: sections[2]?.standardScore || 0,
      color: "#96BFEF", // Lighter blue/periwinkle - matches original
    },
    {
      name: "Reasoning\nAbility",
      value: sections[3]?.standardScore || 0,
      color: "#7C699E", // Dark purple/gray - matches original
    },
    {
      name: "Problem-Solving\nAbility",
      value: sections[4]?.standardScore || 0,
      color: "#95D16F", // Light green - matches original
    },
    {
      name: "Mathematics\nLearning Competency",
      value: overallScore,
      color: "#F8C857", // Yellow/orange - matches original
    },
  ];

  return (
    <div
      className="bg-white p-8 min-h-screen print:p-8 report-page-1"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* Header - Match original layout */}
      <div className="flex items-center justify-center mb-8 border-b-3 border-black pb-4">
        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td
                className="text-right pr-4"
                style={{ verticalAlign: "middle" }}
              >
                {/* Logo placeholder - should use actual logo image */}
                <div className="text-red-600 text-4xl font-bold">able</div>
              </td>
              <td style={{ verticalAlign: "middle", textAlign: "left" }}>
                <span className="text-7xl font-serif font-bold">Report</span>
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
      <div className="mb-8">
        <div className="mb-4">
          <span className="text-xl font-bold">
            1. Comprehensive Mathematical Thinking Ability Diagnostic Test
          </span>
        </div>

        <table className="table table-bordered w-full">
          <tbody>
            <tr>
              <td style={{ verticalAlign: "middle", fontSize: "17px" }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 1 - COMPUTATIONAL ABILITY
                </span>
              </td>
              <td style={{ verticalAlign: "middle", fontSize: "13px" }}>
                It assesses the ability to simplify a given equation by applying
                the basic laws or properties of operations, and the ability to
                apply basic formulas or calculation methods.
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: "middle", fontSize: "17px" }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 2 - Conceptual Understanding Ability
                </span>
              </td>
              <td style={{ verticalAlign: "middle", fontSize: "13px" }}>
                Assess the level of understanding of the meaning and properties
                of mathematical terms, symbols, formulas, graphs, and tables
                given in the problem.
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: "middle", fontSize: "17px" }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 3 - Concept Application Ability
                </span>
              </td>
              <td style={{ verticalAlign: "middle", fontSize: "13px" }}>
                It assesses the ability to understand and apply mathematical
                concepts related to a given problem, the ability to express a
                given problem situation mathematically, and the ability to
                rephrase a mathematical expression into another expression.
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: "middle", fontSize: "17px" }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 4 - Reasoning Abilities
                </span>
              </td>
              <td style={{ verticalAlign: "middle", fontSize: "13px" }}>
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
              <td style={{ verticalAlign: "middle", fontSize: "17px" }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  SECTION 5 - PROBLEM-SOLVING SKILLS
                </span>
              </td>
              <td style={{ verticalAlign: "middle", fontSize: "13px" }}>
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
      <div className="mb-8">
        <div className="mb-4">
          <span className="text-xl font-bold">2. </span>
          <span className="text-2xl font-bold">{testCode} </span>
          <span className="text-xl">Student's diagnostic test results - </span>
          <span className="text-2xl font-bold text-red-600">[]</span>
        </div>
        <div className="text-center mb-4">
          <span className="text-xl">
            Able Math Ability Diagnostic Test Results
          </span>
        </div>

        {/* Horizontal Bar Chart */}
        <div
          style={{ height: "400px", minHeight: "400px", width: "100%" }}
          className="print:!h-[300px] print:!min-h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={400}>
            <RechartsBarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Score (%)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
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
      </div>
    </div>
  );
}
