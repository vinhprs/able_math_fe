import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/services/reportService';
import type { ReportCard } from '@/types/report';
import { FileText, Calendar, Award, Eye, Download, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { formatDateShort } from '@/lib/utils';
import { toastError } from '@/lib/toast';

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(data);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      toastError(error?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">My Reports</h1>
        <p className="text-secondary-500 mt-1">View your test results and reports</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No reports yet
            </h3>
            <p className="text-secondary-600">
              Your teacher will publish reports after reviewing
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reports Grid */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            // Get test info from relation or reportData
            const testTitle = report.test?.title || report.reportData?.testInfo?.title || 'Test Report';
            const testCode = report.test?.testCode || report.reportData?.testInfo?.testCode || '';
            const totalScore = report.submission?.totalScore || report.reportData?.scores?.totalScore || 0;
            const standardScore = report.submission?.standardScore || report.reportData?.scores?.standardScore || 0;

            return (
              <Card
                key={report.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {testTitle}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {testCode}
                  </p>
                </div>

                {/* Card Body */}
                <CardContent className="p-4">
                  {/* Score */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">Score:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">
                        {totalScore}
                      </span>
                      {standardScore > 0 && (
                        <div className="text-sm text-secondary-500">
                          {Math.round(standardScore)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Published Date */}
                  <div className="flex items-center gap-2 text-secondary-600 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Published{' '}
                      {report.publishedAt
                        ? formatDateShort(report.publishedAt)
                        : 'N/A'}
                    </span>
                  </div>

                  {/* Teacher Comment */}
                  {report.reviewComment && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-900">
                        <strong>Teacher:</strong> {report.reviewComment}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        // Navigate to report detail using reportId
                        navigate(`/student/reports/${report.id}`);
                      }}
                      variant="primary"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    {report.pdfUrl && (
                      <Button
                        onClick={() => reportService.downloadPdf(report.pdfUrl!)}
                        variant="outline"
                        size="sm"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

