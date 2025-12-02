import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useStudentResults } from '@/hooks/useResults';
import { formatDate } from '@/lib/utils';

interface ResultFilters {
  testType?: string;
  page: number;
}

// Score Circle Component
function ScoreCircle({ score }: { score: number | null | undefined }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.round(score ?? 0);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 80) return '#3b82f6'; // blue
    if (percentage >= 70) return '#eab308'; // yellow
    if (percentage >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="relative">
      <svg width="140" height="140" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={getColor()}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: getColor() }}>
            {percentage}%
          </p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-500">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
}

// Result Card Skeleton
function ResultCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="h-6 bg-secondary-200 rounded w-3/4 mb-4"></div>
      <div className="h-32 bg-secondary-200 rounded mb-4"></div>
      <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
    </Card>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-secondary-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

// Helper: Calculate average score
function calculateAverage(results: any[]) {
  if (!results || results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.standardScore, 0);
  return Math.round(sum / results.length);
}

export function ResultsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ResultFilters>({ page: 1 });

  // Fetch results
  const { data: resultsData, isLoading, error } = useStudentResults(filters);

  const handleFilterChange = (key: keyof ResultFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const getGradeBadge = (score: number) => {
    if (score >= 90) return { label: 'A', variant: 'success' as const };
    if (score >= 80) return { label: 'B', variant: 'info' as const };
    if (score >= 70) return { label: 'C', variant: 'warning' as const };
    if (score >= 60) return { label: 'D', variant: 'warning' as const };
    return { label: 'F', variant: 'danger' as const };
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">My Results</h1>
          <p className="text-secondary-500 mt-1">View your test results and performance</p>
        </div>

        {/* Statistics Summary */}
        {resultsData && resultsData.data && resultsData.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Tests"
              value={resultsData.total || 0}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="Average Score"
              value={`${calculateAverage(resultsData.data)}%`}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Latest Result"
              value={
                resultsData.data[0]?.standardScore
                  ? `${Math.round(resultsData.data[0].standardScore)}%`
                  : 'N/A'
              }
              icon={Award}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Select
                label="Test Type"
                value={filters.testType || ''}
                onChange={(e) =>
                  handleFilterChange('testType', e.target.value || undefined)
                }
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'ACHIEVEMENT', label: 'Achievement Test' },
                  { value: 'ADTM', label: 'A-DTM Test' },
                ]}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1 })}
              disabled={!filters.testType}
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error loading results</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'Please try again later'}
              </p>
            </div>
          </Card>
        )}

        {/* Results Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        ) : !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resultsData?.data?.map((result) => {
                const grade = getGradeBadge(result.standardScore);

                return (
                  <Card
                    key={result.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/student/results/${result.id}`)}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg line-clamp-2">
                            {result.test.title}
                          </h3>
                          <p className="text-sm text-secondary-500">{result.test.testCode}</p>
                        </div>
                        <Badge variant={grade.variant} className="text-xl font-bold px-4 py-2">
                          {grade.label}
                        </Badge>
                      </div>

                      {/* Score Circle */}
                      <div className="flex items-center justify-center py-4">
                        <ScoreCircle score={result.standardScore ?? 0} />
                      </div>

                      {/* Score Details */}
                      <div className="border-t border-secondary-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600">Raw Score</span>
                          <span className="font-medium">
                            {result.totalScore ?? 0} / {result.maxScore ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600">Standard Score</span>
                          <span className="font-medium">
                            {result.standardScore ? Math.round(result.standardScore) : 0}%
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      {result.gradedAt && (
                        <div className="flex items-center gap-2 text-sm text-secondary-500 border-t border-secondary-200 pt-4">
                          <Calendar className="w-4 h-4" />
                          <span>Graded: {formatDate(result.gradedAt)}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/results/${result.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {resultsData && (!resultsData.data || resultsData.data.length === 0) && (
              <Card className="p-12 text-center">
                <Award className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">No results yet</h3>
                <p className="text-secondary-500">
                  Complete and submit a test to see your results here
                </p>
              </Card>
            )}

            {/* Pagination */}
            {resultsData && resultsData.totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={resultsData.totalPages}
                onPageChange={(page) => handleFilterChange('page', page)}
              />
            )}
          </>
        )}
      </div>
  );
}

