import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/services/reportService';
import { FileText, Clock, User, Eye, Loader2, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatDateShort } from '@/lib/utils';
import { toastError } from '@/lib/toast';
import { ReportStatus } from '@/types/report';
import { TestType } from '@shared/types/enum';

interface AdminReport {
  id: string;
  submissionId: string;
  studentName: string;
  studentId: string;
  testTitle: string;
  testCode: string;
  testType: TestType;
  status: ReportStatus;
  teacherName: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  totalScore: number;
  pdfUrl: string | null;
}

export function AdminReportsList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status?: ReportStatus;
    testType?: TestType;
    teacherId?: string;
  }>({});

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAllReports(filters);
      setReports(data);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      toastError(error?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'ALL') {
      const { status: _, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, status: status as ReportStatus });
    }
  };

  const handleTestTypeFilter = (testType: string) => {
    if (testType === 'ALL') {
      const { testType: _, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, testType: testType as TestType });
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  // Calculate stats
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === ReportStatus.PENDING_REVIEW).length,
    approved: reports.filter((r) => r.status === ReportStatus.APPROVED).length,
    published: reports.filter((r) => r.status === ReportStatus.PUBLISHED).length,
    rejected: reports.filter((r) => r.status === ReportStatus.REJECTED).length,
  };

  const getStatusBadge = (status: ReportStatus) => {
    const config = {
      [ReportStatus.PENDING_REVIEW]: {
        label: 'Pending',
        className: 'bg-orange-100 text-orange-800',
      },
      [ReportStatus.APPROVED]: {
        label: 'Approved',
        className: 'bg-blue-100 text-blue-800',
      },
      [ReportStatus.PUBLISHED]: {
        label: 'Published',
        className: 'bg-green-100 text-green-800',
      },
      [ReportStatus.REJECTED]: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800',
      },
    };

    const { label, className } = config[status] || config[ReportStatus.PENDING_REVIEW];

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const handleViewReport = (report: AdminReport) => {
    // Navigate to report review page
    if (report.testType === TestType.ADTM) {
      navigate(`/reports/adtm/${report.submissionId}`);
    } else {
      navigate(`/reports/achievement/${report.submissionId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Reports</h1>
        <p className="text-gray-600 mt-1">View and manage all student reports</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.status || 'ALL'}
                onChange={(e) => handleStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: ReportStatus.PENDING_REVIEW, label: 'Pending Review' },
                  { value: ReportStatus.APPROVED, label: 'Approved' },
                  { value: ReportStatus.PUBLISHED, label: 'Published' },
                  { value: ReportStatus.REJECTED, label: 'Rejected' },
                ]}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.testType || 'ALL'}
                onChange={(e) => handleTestTypeFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Types' },
                  { value: TestType.ACHIEVEMENT, label: 'Achievement' },
                  { value: TestType.ADTM, label: 'A-DTM' },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.approved}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No reports have been generated yet'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      {!loading && reports.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {report.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.testTitle}
                          </div>
                          <div className="text-sm text-gray-500">{report.testCode}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {report.testType}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{report.teacherName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {report.totalScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateShort(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleViewReport(report)}
                          variant="primary"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

