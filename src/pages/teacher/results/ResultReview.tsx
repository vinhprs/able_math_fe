import { useParams, useNavigate } from 'react-router-dom';
import { useAchievementReport, useAdtmReport, useGeneratePdf, downloadPdf } from '@/hooks/useReports';
import { AchievementReport, AdtmReport } from '@/components/reports';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Printer, Download, ArrowLeft, Loader2, CheckCircle, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

export function ResultReview() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  // Determine test type from submission
  const achievementQuery = useAchievementReport(submissionId || '');
  const adtmQuery = useAdtmReport(submissionId || '');
  const generatePdfMutation = useGeneratePdf();

  const isLoading = achievementQuery.isLoading || adtmQuery.isLoading;
  const isError = achievementQuery.isError && adtmQuery.isError;
  const reportData = achievementQuery.data || adtmQuery.data;
  const testType = achievementQuery.data ? 'ACHIEVEMENT' : 'ADTM';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!submissionId) return;

    try {
      await generatePdfMutation.mutateAsync(submissionId);
      downloadPdf(submissionId);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const handleApprove = () => {
    // TODO: Implement approve functionality
    console.log('Approve report:', submissionId);
  };

  const handlePublish = () => {
    // TODO: Implement publish functionality
    console.log('Publish report:', submissionId);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !reportData) {
    return (
      <MainLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">Report Not Found</h2>
              <p className="text-secondary-600 mb-4">
                The report you're looking for doesn't exist or couldn't be loaded.
              </p>
              <Button onClick={() => navigate('/teacher/dashboard')}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 print:space-y-0">
        {/* Action Buttons - Hidden in print */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={generatePdfMutation.isPending}
              className="print:hidden"
            >
              {generatePdfMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleApprove}
              className="print:hidden"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={handlePublish}
              className="print:hidden"
            >
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-container">
          {testType === 'ACHIEVEMENT' ? (
            <AchievementReport reportData={reportData as any} />
          ) : (
            <AdtmReport reportData={reportData as any} />
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem;
          }
          .print\\:space-y-0 {
            space-y: 0;
          }
          .print\\:space-y-4 {
            space-y: 1rem;
          }
          .report-container {
            padding: 0;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </MainLayout>
  );
}

