import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/services/reportService';
import type { PendingReport } from '@/types/report';
import { FileText, Clock, User, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { formatDateShort } from '@/lib/utils';
import { toastError } from '@/lib/toast';

export default function PendingReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getPendingReports();
      setReports(data);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      toastError(error?.message || 'Failed to load pending reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Reports</h1>
        <p className="text-gray-600 mt-1">Review and approve student reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reports.length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600" />
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending reports
            </h3>
            <p className="text-gray-600">All reports have been reviewed!</p>
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
                          <div className="text-sm text-gray-500">
                            {report.testCode}
                          </div>
                        </div>
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
                          onClick={() =>
                            navigate(`/teacher/reports/${report.id}/review`)
                          }
                          variant="primary"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
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

