interface SectionSimpleProps {
  section: {
    number: number;
    name: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
  };
}

export function SectionSimple({ section }: SectionSimpleProps) {
  const getPerformanceLabel = (score: number) => {
    if (score >= 90)
      return { label: "Excellent", color: "text-green-700", badge: "⭐" };
    if (score >= 80)
      return { label: "Very Good", color: "text-blue-700", badge: "👍" };
    if (score >= 70)
      return { label: "Good", color: "text-cyan-700", badge: "✓" };
    if (score >= 60)
      return { label: "Fair", color: "text-yellow-700", badge: "⚠️" };
    return { label: "Needs Improvement", color: "text-red-700", badge: "📚" };
  };

  const performance = getPerformanceLabel(section.standardScore);

  return (
    <div className="rounded-lg border bg-white p-6 print:border-2 print:break-inside-avoid">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span
          className={`
            flex items-center justify-center w-8 h-8 rounded-full
            ${
              section.number === 4
                ? "bg-purple-100 text-purple-700"
                : "bg-pink-100 text-pink-700"
            }
            font-bold
          `}
        >
          {section.number}
        </span>
        <span>
          Section {section.number}: {section.name}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Raw Score</p>
          <p className="text-4xl font-bold text-gray-900">
            {section.rawScore}
            <span className="text-2xl text-gray-500">/{section.maxScore}</span>
          </p>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Standard Score</p>
          <p className="text-4xl font-bold text-green-700">
            {section.standardScore.toFixed(1)}
            <span className="text-2xl text-gray-500">%</span>
          </p>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">{performance.badge}</div>
          <p className={`text-xl font-bold ${performance.color}`}>
            {performance.label}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`
              h-full transition-all duration-1000 ease-out
              ${
                section.standardScore >= 80
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : section.standardScore >= 60
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-red-400 to-pink-500"
              }
            `}
            style={{ width: `${section.standardScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>{section.standardScore.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
