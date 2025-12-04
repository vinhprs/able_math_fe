import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '@/services/reportService';
import { AchievementReport, AdtmReport } from '@/components/reports';
import { Loader2, ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { AchievementReportData, AdtmReportData } from '@/types/reports.types';

export default function StudentReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<AchievementReportData | AdtmReportData | null>(null);
  const [reportCard, setReportCard] = useState<any>(null);
  const [testType, setTestType] = useState<'ACHIEVEMENT' | 'ADTM' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    if (!reportId) return;

    try {
      setLoading(true);
      setError(null);

      // First, get the report card to check status and get teacher comment
      const reports = await reportService.getMyReports();
      const card = reports.find((r) => r.id === reportId);
      
      if (!card) {
        throw new Error('Report not found');
      }

      if (card.status !== 'PUBLISHED') {
        throw new Error('Report is not published yet');
      }

      setReportCard(card);

      // Call API to get published report data
      const data = await reportService.getPublishedReport(reportId);

      // Determine test type from response
      if ((data as any).test?.testType === 'ACHIEVEMENT' || (data as AchievementReportData).test?.code) {
        setTestType('ACHIEVEMENT');
      } else if ((data as any).test?.testType === 'ADTM' || (data as AdtmReportData).test?.testCode) {
        setTestType('ADTM');
      }

      setReportData(data);
    } catch (err: any) {
      console.error('Failed to load report:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportCard?.pdfUrl) {
      alert('PDF not available yet');
      return;
    }
    reportService.downloadPdf(reportCard.pdfUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Error Loading Report</h3>
            <p className="text-sm text-secondary-600 mb-4">{error}</p>
            <Button
              onClick={() => navigate('/student/reports')}
              variant="outline"
            >
              Back to Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData || !testType) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Report Not Found</h3>
            <p className="text-secondary-600 mb-4">The report you're looking for doesn't exist or couldn't be loaded.</p>
            <Button
              onClick={() => navigate('/student/reports')}
              variant="primary"
            >
              Back to Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Header - Hidden on print */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/student/reports')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Reports
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </Button>

            {reportCard?.pdfUrl && (
              <Button
                variant="primary"
                onClick={handleDownloadPdf}
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-lg print:shadow-none print:rounded-none">
        {testType === 'ACHIEVEMENT' ? (
          <AchievementReport reportData={reportData as AchievementReportData} />
        ) : (
          <AdtmReport reportData={reportData as AdtmReportData} />
        )}
      </div>

      {/* Teacher Comment - Hidden on print */}
      {reportCard?.reviewComment && (
        <Card className="bg-primary-50 border-primary-200 print:hidden">
          <CardContent className="p-6">
            <h3 className="font-semibold text-primary-900 mb-2">
              Teacher's Comment
            </h3>
            <p className="text-primary-800">{reportCard.reviewComment}</p>
          </CardContent>
        </Card>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:space-y-0 {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}

