interface OverallScoreCardProps {
  overallScore: number;
  sections: Array<{ standardScore: number }>;
}

export function OverallScoreCard({
  overallScore,
  sections,
}: OverallScoreCardProps) {
  const getPerformanceLevel = (score: number) => {
    if (score >= 90)
      return {
        label: "Excellent",
        color: "from-green-500 to-emerald-600",
        badge: "⭐",
      };
    if (score >= 80)
      return {
        label: "Very Good",
        color: "from-blue-500 to-indigo-600",
        badge: "👍",
      };
    if (score >= 70)
      return { label: "Good", color: "from-cyan-500 to-blue-500", badge: "✓" };
    if (score >= 60)
      return {
        label: "Fair",
        color: "from-yellow-500 to-orange-500",
        badge: "⚠️",
      };
    return {
      label: "Needs Improvement",
      color: "from-red-500 to-pink-600",
      badge: "📚",
    };
  };

  const performance = getPerformanceLevel(overallScore);

  return (
    <div className="rounded-lg border-2 bg-white p-8 mb-8 shadow-lg print:shadow-none">
      <h3 className="text-xl font-semibold text-gray-700 mb-6 uppercase tracking-wide">
        Overall Mathematics Competency
      </h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Score Display */}
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <p className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {overallScore.toFixed(1)}
            </p>
            <span className="text-3xl text-gray-500 font-medium">/ 100</span>
          </div>

          <p className="text-sm text-gray-600 mt-3">Overall Standard Score</p>

          {/* Mini section scores */}
          <div className="mt-6 grid grid-cols-5 gap-2">
            {sections.map((section, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`
                  text-xs font-semibold px-2 py-1 rounded
                  ${
                    section.standardScore >= 80
                      ? "bg-green-100 text-green-800"
                      : section.standardScore >= 70
                      ? "bg-blue-100 text-blue-800"
                      : section.standardScore >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
                >
                  P{idx + 1}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {section.standardScore.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Badge */}
        <div
          className={`
            rounded-2xl w-40 h-40 flex flex-col items-center justify-center
            bg-gradient-to-br ${performance.color}
            text-white shadow-xl print:shadow-none
            transform transition-transform hover:scale-105 print:hover:scale-100
          `}
        >
          <div className="text-5xl mb-2">{performance.badge}</div>
          <div className="text-xl font-bold text-center">
            {performance.label}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`
              h-full bg-gradient-to-r ${performance.color}
              transition-all duration-1000 ease-out
            `}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
