import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  TrendingUp,
  Eye,
  Send,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useTeacherTests, useTeacherTestDetails, useTeacherTestStats } from '@/hooks/useTeacherTests';
import type { ITest } from '@/types/test.types';

interface TestFilters {
  grade?: string;
  level?: string;
  search?: string;
  page: number;
}

const GRADE_OPTIONS = [
  { value: '', label: 'All Grades' },
  { value: 'E2', label: 'Elementary 2' },
  { value: 'E3', label: 'Elementary 3' },
  { value: 'E4', label: 'Elementary 4' },
  { value: 'E5', label: 'Elementary 5' },
  { value: 'E6', label: 'Elementary 6' },
  { value: 'M1', label: 'Middle 1' },
  { value: 'M2', label: 'Middle 2' },
  { value: 'M3', label: 'Middle 3' },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: '1', label: 'Level 1' },
  { value: '2', label: 'Level 2' },
  { value: '3', label: 'Level 3' },
];

interface TestCardProps {
  test: ITest;
  onViewDetails: () => void;
  onAssign: () => void;
}

function TestCard({ test, onViewDetails, onAssign }: TestCardProps) {
  const levelBadgeVariant = (level: number) => {
    if (level === 1) return 'success';
    if (level === 2) return 'warning';
    if (level === 3) return 'danger';
    return 'default';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-secondary-900">{test.title}</h3>
            <Badge variant={levelBadgeVariant(test.level)}>
              L{test.level}
            </Badge>
          </div>
          <p className="text-sm text-secondary-500">{test.testCode}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-secondary-200">
          <div>
            <p className="text-sm text-secondary-500">Questions</p>
            <p className="text-xl font-bold text-secondary-900">
              {test.questions?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Total Score</p>
            <p className="text-xl font-bold text-secondary-900">{test.totalScore}</p>
          </div>
        </div>

        {/* Grade & Term */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-secondary-500">Grade</span>
            <span className="font-medium text-secondary-900">{test.grade}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-500">Term</span>
            <span className="font-medium text-secondary-900">{test.term}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button className="flex-1" onClick={onAssign}>
            <Send className="w-4 h-4 mr-2" />
            Assign
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TestCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="h-6 bg-secondary-200 rounded animate-pulse" />
        <div className="h-4 bg-secondary-200 rounded animate-pulse w-2/3" />
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="h-12 bg-secondary-200 rounded animate-pulse" />
          <div className="h-12 bg-secondary-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2 pt-4">
          <div className="flex-1 h-10 bg-secondary-200 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-secondary-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

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
      {startPage > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}
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

interface TestDetailsModalProps {
  testId: string;
  onClose: () => void;
  onAssign: () => void;
}

function TestDetailsModal({ testId, onClose, onAssign }: TestDetailsModalProps) {
  const { data: testDetails, isLoading: isLoadingDetails } = useTeacherTestDetails(testId);
  const { data: stats, isLoading: isLoadingStats } = useTeacherTestStats(testId);

  if (isLoadingDetails) {
    return (
      <Modal isOpen onClose={onClose} size="lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Modal>
    );
  }

  if (!testDetails) {
    return (
      <Modal isOpen onClose={onClose} size="lg">
        <div className="text-center py-12">
          <p className="text-secondary-600">Test not found</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">{testDetails.title}</h2>
          <p className="text-secondary-500">{testDetails.testCode}</p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-secondary-500">Grade</p>
            <p className="font-medium text-secondary-900">{testDetails.grade}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Level</p>
            <p className="font-medium text-secondary-900">L{testDetails.level}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Curriculum</p>
            <p className="font-medium text-secondary-900">{testDetails.curriculum}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Total Score</p>
            <p className="font-medium text-secondary-900">{testDetails.totalScore}</p>
          </div>
        </div>

        {/* Unit Breakdown */}
        {testDetails.unitBreakdown && testDetails.unitBreakdown.length > 0 && (
          <div>
            <h3 className="font-bold mb-3 text-secondary-900">Unit Breakdown</h3>
            <div className="space-y-2">
              {testDetails.unitBreakdown.map((unit) => (
                <div
                  key={unit.unitName}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <span className="font-medium text-secondary-900">{unit.unitName}</span>
                  <div className="text-sm text-secondary-500">
                    {unit.questionCount} questions • {unit.totalScore} points
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {!isLoadingStats && stats && (
          <div>
            <h3 className="font-bold mb-3 text-secondary-900">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-secondary-500" />
                  <p className="text-sm text-secondary-500">Times Assigned</p>
                </div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.totalAssignments}
                </p>
              </div>
              <div className="p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-secondary-500" />
                  <p className="text-sm text-secondary-500">Completed</p>
                </div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.completedSubmissions}
                </p>
              </div>
              <div className="p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-secondary-500" />
                  <p className="text-sm text-secondary-500">Avg Score</p>
                </div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.avgScore}%
                </p>
              </div>
              <div className="p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-secondary-500" />
                  <p className="text-sm text-secondary-500">Highest</p>
                </div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.highestScore}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-secondary-200">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={onAssign} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Assign to Students
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function TeacherTestBrowse() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TestFilters>({ page: 1 });
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Fetch tests
  const { data: testsData, isLoading } = useTeacherTests({
    ...filters,
    level: filters.level ? parseInt(filters.level) : undefined,
    limit: 10,
  });

  const handleFilterChange = (key: keyof TestFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1 });
  };

  const handleAssignTest = (testId: string) => {
    navigate(`/teacher/assignments/assign?testId=${testId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Browse Tests</h1>
        <p className="text-secondary-500">Select tests to assign to your students</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-end gap-4">
          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <Input
                placeholder="Search by title or code..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Grade */}
          <div className="w-full md:w-48">
            <Select
              value={filters.grade || ''}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              options={GRADE_OPTIONS}
            />
          </div>

          {/* Level */}
          <div className="w-full md:w-48">
            <Select
              value={filters.level || ''}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              options={LEVEL_OPTIONS}
            />
          </div>

          {/* Clear Button */}
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!filters.grade && !filters.level && !filters.search}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </Card>

      {/* Test Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <TestCardSkeleton key={i} />
          ))}
        </div>
      ) : testsData && testsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testsData.data.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onViewDetails={() => setSelectedTestId(test.id)}
                onAssign={() => handleAssignTest(test.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {testsData && testsData.totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={testsData.totalPages}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-secondary-500">No tests found. Try adjusting your filters.</p>
        </Card>
      )}

      {/* Test Details Modal */}
      {selectedTestId && (
        <TestDetailsModal
          testId={selectedTestId}
          onClose={() => setSelectedTestId(null)}
          onAssign={() => {
            setSelectedTestId(null);
            handleAssignTest(selectedTestId);
          }}
        />
      )}
    </div>
  );
}

