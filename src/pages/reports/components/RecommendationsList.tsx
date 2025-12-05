interface RecommendationsListProps {
  recommendations: string[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-lg border-2 p-6 print:bg-white">
      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {idx + 1}
            </div>
            <p className="flex-1 text-gray-800 leading-relaxed pt-2">
              {rec}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

