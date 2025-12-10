import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AdtmDomainData } from "@/types/reports.types";

interface DomainSummaryPageProps {
  basicLearning: AdtmDomainData["basicLearningAbility"];
  creativeThinking: AdtmDomainData["creativeThinkingAbility"];
}

export function DomainSummaryPage({
  basicLearning,
  creativeThinking,
}: DomainSummaryPageProps) {
  // Helper function to safely convert to number
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Safely get average scores
  const basicLearningAvg = toNumber(basicLearning?.averageScore);
  const creativeThinkingAvg = toNumber(creativeThinking?.averageScore);

  // Prepare chart data for Domain 1
  const domain1ChartData = [
    {
      name: "Calculation",
      score: toNumber(basicLearning?.sections?.[0]?.standardScore),
    },
    {
      name: "Understanding",
      score: toNumber(basicLearning?.sections?.[1]?.standardScore),
    },
    {
      name: "Application",
      score: toNumber(basicLearning?.sections?.[2]?.standardScore),
    },
  ];

  // Prepare chart data for Domain 2
  const domain2ChartData = [
    {
      name: "Reasoning",
      score: toNumber(creativeThinking?.sections?.[0]?.standardScore),
    },
    {
      name: "Problem-Solving",
      score: toNumber(creativeThinking?.sections?.[1]?.standardScore),
    },
  ];

  const getEvaluationBadgeClass = (evaluation: string) => {
    switch (evaluation) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="domain-summary-page page bg-white p-8 min-h-screen print:p-8">
      <h1 className="text-3xl font-bold mb-8">Domain Analysis</h1>

      {/* Domain 1: Basic Learning Ability */}
      <div className="domain-block mb-12 border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Domain 1: Basic Learning Ability
          </h2>
          <div
            className={`px-4 py-2 rounded-full font-bold text-white ${getEvaluationBadgeClass(
              basicLearning?.evaluation || "low"
            )}`}
          >
            {(basicLearning?.evaluation || "low").toUpperCase()}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="text-sm text-gray-600 mb-1">Average Score</div>
          <div
            className="text-4xl font-bold"
            style={{ color: basicLearning?.evaluationColor || "#EF4444" }}
          >
            {basicLearningAvg.toFixed(2)}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Sections Included:</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Section 1 - Calculation Ability:</span>
              <span className="font-bold">
                {toNumber(basicLearning?.sections?.[0]?.standardScore).toFixed(
                  2
                )}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Section 2 - Conceptual Understanding:</span>
              <span className="font-bold">
                {toNumber(basicLearning?.sections?.[1]?.standardScore).toFixed(
                  2
                )}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Section 3 - Conceptual Application:</span>
              <span className="font-bold">
                {toNumber(basicLearning?.sections?.[2]?.standardScore).toFixed(
                  2
                )}
              </span>
            </li>
          </ul>
        </div>

        {/* Bar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domain1ChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}%`, "Score"]}
              />
              <Bar
                dataKey="score"
                fill={basicLearning?.evaluationColor || "#EF4444"}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain 2: Creative Thinking Ability */}
      <div className="domain-block mb-12 border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Domain 2: Creative Thinking Ability
          </h2>
          <div
            className={`px-4 py-2 rounded-full font-bold text-white ${getEvaluationBadgeClass(
              creativeThinking?.evaluation || "low"
            )}`}
          >
            {(creativeThinking?.evaluation || "low").toUpperCase()}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="text-sm text-gray-600 mb-1">Average Score</div>
          <div
            className="text-4xl font-bold"
            style={{ color: creativeThinking?.evaluationColor || "#EF4444" }}
          >
            {creativeThinkingAvg.toFixed(2)}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Sections Included:</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Section 4 - Reasoning Ability:</span>
              <span className="font-bold">
                {toNumber(
                  creativeThinking?.sections?.[0]?.standardScore
                ).toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Section 5 - Problem-Solving Ability:</span>
              <span className="font-bold">
                {toNumber(
                  creativeThinking?.sections?.[1]?.standardScore
                ).toFixed(2)}
              </span>
            </li>
          </ul>
        </div>

        {/* Bar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domain2ChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}%`, "Score"]}
              />
              <Bar
                dataKey="score"
                fill={creativeThinking?.evaluationColor || "#EF4444"}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evaluation Guide */}
      <div className="evaluation-guide bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Evaluation Criteria</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <div>
              <div className="font-bold">HIGH</div>
              <div className="text-sm text-gray-600">Score ≥ 80</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded"></div>
            <div>
              <div className="font-bold">MEDIUM</div>
              <div className="text-sm text-gray-600">Score 60-79</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <div>
              <div className="font-bold">LOW</div>
              <div className="text-sm text-gray-600">Score &lt; 60</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
