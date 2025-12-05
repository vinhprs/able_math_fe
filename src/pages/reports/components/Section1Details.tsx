interface Section1DetailsProps {
  section: {
    number: number;
    name: string;
    rawScore: number;
    maxScore: number;
    standardScore: number;
    correctCount?: number;
    mistakeCount?: number;
    unsolvedCount?: number;
  };
}

export function Section1Details({ section }: Section1DetailsProps) {
  const totalQuestions =
    (section.correctCount || 0) +
    (section.mistakeCount || 0) +
    (section.unsolvedCount || 0);

  const getPercentage = (count: number) =>
    totalQuestions > 0 ? ((count / totalQuestions) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-lg border bg-white p-6 print:border-2 print:break-inside-avoid">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
          1
        </span>
        <span>Section 1: {section.name}</span>
      </h3>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Raw Score</p>
          <p className="text-3xl font-bold text-blue-700">
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
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Questions</p>
          <p className="text-3xl font-bold text-purple-700">{totalQuestions}</p>
        </div>
      </div>

      {/* Answer Classification */}
      <div>
        <h4 className="font-semibold mb-3 text-gray-700">
          Answer Classification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Correct */}
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">✓</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {section.correctCount || 0}
                </div>
                <div className="text-sm text-green-600">
                  {getPercentage(section.correctCount || 0)}%
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-green-800">Fully Correct</p>
            <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${getPercentage(section.correctCount || 0)}%`,
                }}
              />
            </div>
          </div>

          {/* Mistake */}
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">≈</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-700">
                  {section.mistakeCount || 0}
                </div>
                <div className="text-sm text-orange-600">
                  {getPercentage(section.mistakeCount || 0)}%
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-orange-800">Incorrect</p>
            <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{
                  width: `${getPercentage(section.mistakeCount || 0)}%`,
                }}
              />
            </div>
          </div>

          {/* Unsolved */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">✗</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-700">
                  {section.unsolvedCount || 0}
                </div>
                <div className="text-sm text-red-600">
                  {getPercentage(section.unsolvedCount || 0)}%
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-red-800">Unsolved</p>
            <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{
                  width: `${getPercentage(section.unsolvedCount || 0)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
