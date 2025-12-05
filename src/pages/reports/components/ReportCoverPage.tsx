import type { AdtmReportData } from "@/types/reports.types";
import {
  Bar,
  CartesianGrid,
  Cell,
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
  // Prepare chart data matching original design
  const chartData = [
    {
      name: "Calculation\nAbility",
      value: sections[0]?.standardScore || 0,
      color: "rgba(59, 130, 246, 0.8)", // Blue
    },
    {
      name: "Conceptual\nUnderstanding",
      value: sections[1]?.standardScore || 0,
      color: "rgba(6, 182, 212, 0.8)", // Cyan
    },
    {
      name: "Conceptual\nApplication",
      value: sections[2]?.standardScore || 0,
      color: "rgba(156, 163, 175, 0.8)", // Gray
    },
    {
      name: "Reasoning\nAbility",
      value: sections[3]?.standardScore || 0,
      color: "rgba(229, 231, 235, 0.8)", // Light Gray
    },
    {
      name: "Problem-Solving\nAbility",
      value: sections[4]?.standardScore || 0,
      color: "rgba(229, 231, 235, 0.8)", // Light Gray
    },
    {
      name: "Mathematics\nLearning Competency",
      value: overallScore,
      color: "rgba(234, 179, 8, 0.8)", // Yellow
    },
  ];

  return (
    <div
      className="bg-white p-8 min-h-screen print:p-8 report-page-1"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* Header */}
      <div className="flex items-center mb-8 border-b-2 border-black pb-4">
        <div className="text-red-600 text-4xl font-bold mr-4">able</div>
        <div className="text-sm">
          <div>Diagnostic</div>
          <div>Test of</div>
          <div>Mathematics</div>
        </div>
        <div className="text-6xl font-serif ml-8">Report</div>
      </div>

      {/* Introductory text */}
      <div className="mb-8 text-sm leading-relaxed">
        <p className="mb-4">
          This report is designed to help students identify their mathematical
          strengths and areas for improvement. The assessment evaluates five key
          competencies that are essential for mathematical proficiency and
          problem-solving skills.
        </p>
        <p className="mb-4">
          The scores in this report represent the student's performance across
          different mathematical domains. By analyzing these results, educators
          and parents can provide targeted support to enhance the student's
          mathematical abilities and build a strong foundation for future
          learning.
        </p>
        <p>
          This report is divided into two sections: first, a summary of scores
          by mathematical competency area, and second, a detailed analysis that
          identifies specific strengths and weaknesses to guide personalized
          instruction and practice.
        </p>
      </div>

      {/* Section Descriptions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          1. Overall Summary by Section
        </h2>

        <div className="space-y-3">
          <div className="border border-gray-300 p-3">
            <div className="font-bold mb-1">
              SECTION 1 - Calculation Ability
            </div>
            <div className="text-sm">
              Assesses computational skills including arithmetic operations,
              mental math, and calculation accuracy. Measures speed and
              precision in mathematical computations.
            </div>
          </div>

          <div className="border border-gray-300 p-3">
            <div className="font-bold mb-1">
              SECTION 2 - Conceptual Understanding
            </div>
            <div className="text-sm">
              Evaluates understanding of fundamental mathematical concepts
              including numbers, operations, shapes, and patterns. Tests the
              ability to explain and apply basic principles.
            </div>
          </div>

          <div className="border border-gray-300 p-3">
            <div className="font-bold mb-1">
              SECTION 3 - Conceptual Application
            </div>
            <div className="text-sm">
              Measures the ability to apply mathematical concepts to various
              situations and contexts. Assesses flexibility in using
              mathematical knowledge across different problem types.
            </div>
          </div>

          <div className="border border-gray-300 p-3">
            <div className="font-bold mb-1">SECTION 4 - Reasoning Ability</div>
            <div className="text-sm">
              Tests logical thinking, pattern recognition, and deductive
              reasoning skills. Evaluates the ability to analyze relationships
              and draw mathematical conclusions.
            </div>
          </div>

          <div className="border border-gray-300 p-3">
            <div className="font-bold mb-1">
              SECTION 5 - Problem Solving Ability
            </div>
            <div className="text-sm">
              Assesses complex problem-solving skills including multi-step
              problems, real-world applications, and critical thinking. Measures
              creativity and strategic thinking in mathematics.
            </div>
          </div>
        </div>
      </div>

      {/* Overall Evaluation Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">
          2. Overall Evaluation - [{testCode}]
        </h2>
        <div className="text-sm text-gray-600 mb-1">
          [Student Name: {studentName}]
        </div>
        <div className="text-sm mb-4">
          Test Score: Overall Mathematics Learning Evaluation
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
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
