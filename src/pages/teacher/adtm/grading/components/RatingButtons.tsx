interface RatingButtonsProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
}

export function RatingButtons({ value, onChange, max }: RatingButtonsProps) {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`
            w-12 h-12 rounded-lg font-bold text-lg border-2
            transition-colors
            ${
              value === level
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
            }
          `}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
