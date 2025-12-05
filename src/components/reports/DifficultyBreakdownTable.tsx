import type { DifficultyBreakdown } from '@/types/reports.types';
import {
  analyzeDifficultyPerformance,
  getPerformanceLevel,
  calculateOverallStandard,
} from '@/hooks/useDifficultyBreakdown';
import { Loader2, Star, ThumbsUp, AlertCircle, XCircle } from 'lucide-react';
import { Alert } from '@/components/ui';

interface DifficultyBreakdownTableProps {
  title?: string;
  data: DifficultyBreakdown[];
  loading?: boolean;
  showInsights?: boolean;
  showTotal?: boolean;
}

/**
 * Get difficulty badge color
 */
function getDifficultyColor(level: number): string {
  const colors = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-red-100 text-red-800',
  };
  return colors[level as keyof typeof colors] || colors[1];
}


/**
 * Get score color class
 */
function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-600 font-semibold';
  if (score >= 60) return 'text-blue-600 font-semibold';
  if (score >= 40) return 'text-orange-600 font-semibold';
  return 'text-red-600 font-semibold';
}

/**
 * Get performance icon
 */
function PerformanceIcon({ level }: { level: 'excellent' | 'good' | 'fair' | 'poor' }) {
  const config = {
    excellent: { icon: Star, color: 'text-green-500' },
    good: { icon: ThumbsUp, color: 'text-blue-500' },
    fair: { icon: AlertCircle, color: 'text-orange-500' },
    poor: { icon: XCircle, color: 'text-red-500' },
  };

  const { icon: Icon, color } = config[level] || config.fair;

  return <Icon className={`w-4 h-4 ${color}`} />;
}

/**
 * Difficulty Breakdown Table Component
 */
export function DifficultyBreakdownTable({
  title,
  data,
  loading = false,
  showInsights = false,
  showTotal = false,
}: DifficultyBreakdownTableProps) {
  const insights = showInsights ? analyzeDifficultyPerformance(data) : [];
  const overallStandard = showTotal ? calculateOverallStandard(data) : null;

  return (
    <div className="rounded-lg border bg-white p-4">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          {loading && (
            <span className="flex items-center gap-2 text-sm text-secondary-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating...
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-700">
                Difficulty
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-secondary-700">
                Full Marks
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-secondary-700">
                Raw Score
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-secondary-700">
                Standard Score
              </th>
              {showInsights && (
                <th className="px-4 py-2 text-center text-sm font-semibold text-secondary-700">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const performanceLevel = getPerformanceLevel(row.standardScore);

              return (
                <tr
                  key={row.difficulty}
                  className={`border-b transition-colors hover:bg-gray-50 ${
                    loading ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${getDifficultyColor(row.difficulty)}`}
                    >
                      Level {row.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-secondary-900">
                    {row.fullMarks}
                  </td>
                  <td className="px-4 py-2 text-right text-secondary-700">{row.rawScore}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={getScoreColorClass(row.standardScore)}>
                      {row.standardScore.toFixed(1)}%
                    </span>
                  </td>
                  {showInsights && (
                    <td className="px-4 py-2 text-center">
                      <PerformanceIcon level={performanceLevel} />
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Summary row */}
            {showTotal && overallStandard !== null && (
              <tr className="border-t-2 bg-gray-50 font-semibold">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right">
                  {data.reduce((sum, d) => sum + d.fullMarks, 0)}
                </td>
                <td className="px-4 py-2 text-right">
                  {data.reduce((sum, d) => sum + d.rawScore, 0)}
                </td>
                <td className="px-4 py-2 text-right">
                  <span className={getScoreColorClass(overallStandard)}>
                    {overallStandard.toFixed(1)}%
                  </span>
                </td>
                {showInsights && <td />}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Insights */}
      {showInsights && insights.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-secondary-700">Insights:</h4>
          {insights.map((insight, i) => {
            const IconComponent =
              insight.icon === 'star'
                ? Star
                : insight.icon === 'thumbs-up'
                  ? ThumbsUp
                  : insight.icon === 'alert-circle'
                    ? AlertCircle
                    : XCircle;

            return (
              <Alert
                key={i}
                variant={
                  insight.type === 'success'
                    ? 'success'
                    : insight.type === 'warning'
                      ? 'warning'
                      : insight.type === 'error'
                        ? 'danger'
                        : 'info'
                }
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm">{insight.message}</span>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
}

