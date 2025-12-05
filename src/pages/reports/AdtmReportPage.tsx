import { Alert, Spinner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import type { AdtmReportData } from "@/types/reports.types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ReportActions } from "./components/ReportActions";
import { ReportAnalysisPage } from "./components/ReportAnalysisPage";
import { ReportCoverPage } from "./components/ReportCoverPage";

export function AdtmReportPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch report data
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adtm-report", submissionId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AdtmReportData;
        timestamp: string;
      }>(`/reports/adtm/${submissionId}`);
      return response.data.data;
    },
    enabled: !!submissionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3 text-lg">Loading report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="danger">
          Unable to load report. Please try again later.
        </Alert>
      </div>
    );
  }

  if (!report) return null;

  // Safety check for charts
  if (!report.charts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="warning">
          Report data is incomplete. Please try again later.
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Navigation Bar (hidden on print) */}
      <div className="sticky top-0 bg-white shadow-md p-4 flex items-center justify-between print:hidden z-10">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setCurrentPage(1)}
            variant={currentPage === 1 ? "primary" : "outline"}
            size="sm"
          >
            Page 1: Report
          </Button>
          <Button
            onClick={() => setCurrentPage(2)}
            variant={currentPage === 2 ? "primary" : "outline"}
            size="sm"
          >
            Page 2: Analysis
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ReportActions submissionId={submissionId!} />
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-[1200px] mx-auto print:max-w-full">
        {currentPage === 1 ? (
          <ReportCoverPage
            studentName={report.student.name}
            testCode={
              report.test.testCode || `A-DTM Level ${report.test.level}`
            }
            sections={report.sections}
            overallScore={report.overallScore}
          />
        ) : (
          <ReportAnalysisPage reportData={report} />
        )}
      </div>

      {/* Page Navigation (hidden on print) */}
      <div className="fixed bottom-8 right-8 flex gap-2 print:hidden z-10">
        <Button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setCurrentPage(2)}
          disabled={currentPage === 2}
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
