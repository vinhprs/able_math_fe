import { UnitRadarChart } from "./UnitRadarChart";
import type { ChartData } from "@/types/reports.types";

interface Section2DetailsProps {
  section: {
    number: number;
    name: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
    unitScores?: Array<{
      unitName: string;
      rawScore: number;
      maxScore: number;
      standardScore: number;
    }>;
  };
  radarChart: ChartData;
}

export function Section2Details({ section, radarChart }: Section2DetailsProps) {
  return (
    <div className="rounded-lg border bg-white p-6 print:border-2 print:break-inside-avoid">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold">
          2
        </span>
        <span>Section 2: {section.name}</span>
      </h3>

      {/* Section Total Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Raw Score</p>
          <p className="text-3xl font-bold text-indigo-700">
            {section.rawScore}
            <span className="text-xl text-gray-500">/{section.maxScore}</span>
          </p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Standard Score</p>
          <p className="text-3xl font-bold text-green-700">
            {section.standardScore.toFixed(1)}
            <span className="text-xl text-gray-500">%</span>
          </p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Number of Units</p>
          <p className="text-3xl font-bold text-blue-700">
            {section.unitScores?.length || 0}
          </p>
        </div>
      </div>

      {/* Unit Scores Table */}
      {section.unitScores && section.unitScores.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-700">Scores by Unit</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Raw Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Standard Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.unitScores.map((unit, idx) => {
                  const getScoreColor = (score: number) => {
                    if (score >= 90)
                      return "bg-green-100 text-green-800 border-green-300";
                    if (score >= 80)
                      return "bg-blue-100 text-blue-800 border-blue-300";
                    if (score >= 70)
                      return "bg-cyan-100 text-cyan-800 border-cyan-300";
                    if (score >= 60)
                      return "bg-yellow-100 text-yellow-800 border-yellow-300";
                    return "bg-red-100 text-red-800 border-red-300";
                  };

                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {unit.unitName}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {unit.rawScore} / {unit.maxScore}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`
                            inline-block px-3 py-1 rounded-full font-bold text-sm border-2
                            ${getScoreColor(unit.standardScore)}
                          `}
                        >
                          {unit.standardScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              unit.standardScore >= 80
                                ? "bg-green-500"
                                : unit.standardScore >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(100, unit.standardScore)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unit Radar Chart */}
      <div className="mt-6">
        <UnitRadarChart data={radarChart} />
      </div>
    </div>
  );
}
