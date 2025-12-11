import { Alert, Spinner } from "@/components/ui";
import api from "@/lib/api";
import type { AdtmReportData } from "@/types/reports.types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ReportActions } from "./components/ReportActions";
import { ReportAnalysisPage } from "./components/ReportAnalysisPage";
import { ReportCoverPage } from "./components/ReportCoverPage";

export function AdtmReportPage() {
  const { submissionId } = useParams<{ submissionId: string }>();

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
      }>(`/teacher/adtm/submissions/${submissionId}/report`);
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
    <>
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
        .adtm-table > tbody > tr > td {
          padding: 0px;
        }
        .adtm-table .fa-check-circle-o:before,
        .adtm-table [data-icon="check-circle"] {
          color: #0f9d58;
        }
        .adtm-table .fa-exclamation-circle:before,
        .adtm-table [data-icon="alert-circle"] {
          color: #f4b400;
        }
        .adtm-table .fa-times-circle:before,
        .adtm-table [data-icon="x-circle"] {
          color: #ed5a4e;
        }
        .border-b-3 {
          border-bottom-width: 3px;
        }
        .table-bordered {
          border: 1px solid #ddd;
        }
        .table-bordered td,
        .table-bordered th {
          border: 1px solid #ddd;
        }
        body {
          font-family: "맑은 고딕", "Malgun Gothic", sans-serif;
        }
      `}</style>
      <div className="min-h-screen bg-gray-100 print:bg-white">
        {/* Print spacing */}
        <div className="hidden print:block" style={{ height: "60px" }}></div>

        {/* Navigation Bar (hidden on print) */}
        <div className="sticky top-0 bg-white shadow-md p-4 flex items-center justify-end print:hidden z-10">
          <div className="flex items-center gap-2">
            <ReportActions submissionId={submissionId!} />
          </div>
        </div>

        {/* Report Content - Match original width */}
        <div
          style={{
            width: "1200px",
            maxWidth: "100%",
            margin: "auto",
            paddingTop: "0px",
          }}
          className="print:w-full"
        >
          {/* Page 1: Report Cover */}
          <ReportCoverPage
            studentName={report.student.name}
            testCode={
              report.test.testCode || `A-DTM Level ${report.test.level}`
            }
            sections={report.sections}
            overallScore={report.overallScore}
          />

          {/* Page 2: Analysis - Continue on same page */}
          <ReportAnalysisPage reportData={report} />
        </div>
      </div>
    </>
  );
}
