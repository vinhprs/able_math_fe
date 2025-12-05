import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAchievementReport,
  useAdtmReport,
  useGeneratePdf,
  downloadPdf,
} from "@/hooks/useReports";
import { AchievementReport } from "@/components/reports";
import { AdtmReportPageForTeacher } from "./AdtmReportPageForTeacher";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import {
  Printer,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Eye,
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { toastSuccess, toastError } from "@/lib/toast";
import { ReportStatus } from "@/types/report";

export function ResultReview() {
  const params = useParams<{ submissionId?: string; reportId?: string }>();
  const navigate = useNavigate();

  // Support both reportId and submissionId routes
  const routeReportId = params.reportId;
  const routeSubmissionId = params.submissionId;

  // State for report card and approval workflow
  const [reportId, setReportId] = useState<string | null>(
    routeReportId || null
  );
  const [actualSubmissionId, setActualSubmissionId] = useState<string | null>(
    routeSubmissionId || null
  );
  const [approving, setApproving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [loadingReportCard, setLoadingReportCard] = useState(false);
  const [knownTestType, setKnownTestType] = useState<
    "ACHIEVEMENT" | "ADTM" | null
  >(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  // Determine test type from submission
  // Only enable queries based on known test type (if available from report card)
  const achievementQuery = useAchievementReport(
    actualSubmissionId || "",
    knownTestType === null || knownTestType === "ACHIEVEMENT"
  );
  const adtmQuery = useAdtmReport(
    actualSubmissionId || "",
    knownTestType === null || knownTestType === "ADTM"
  );
  const generatePdfMutation = useGeneratePdf();

  const isLoading =
    (achievementQuery.isLoading || adtmQuery.isLoading || loadingReportCard) &&
    !achievementQuery.data &&
    !adtmQuery.data;
  const isError = achievementQuery.isError && adtmQuery.isError;
  const reportData = achievementQuery.data || adtmQuery.data;
  const testType = achievementQuery.data
    ? "ACHIEVEMENT"
    : adtmQuery.data
    ? "ADTM"
    : null;

  // Fetch reportId or submissionId based on route params
  useEffect(() => {
    // Reset known test type and report status when route changes
    setKnownTestType(null);
    setReportStatus(null);

    const fetchReportInfo = async () => {
      // If we have reportId from route, we need to get submissionId from report card
      if (routeReportId && !routeSubmissionId) {
        try {
          setLoadingReportCard(true);
          setReportId(routeReportId);
          // Get report card from reportId to get submissionId and testType
          const reportCard = await reportService.getReportCardById(
            routeReportId
          );
          if (reportCard) {
            setActualSubmissionId(reportCard.submissionId);
            // Get testType from report card to avoid calling wrong API
            const testTypeFromCard =
              reportCard.test?.testType ||
              reportCard.reportData?.testInfo?.testType;
            if (testTypeFromCard) {
              setKnownTestType(testTypeFromCard as "ACHIEVEMENT" | "ADTM");
            }
            // Get report status for conditional button rendering
            setReportStatus(reportCard.status);
          }
        } catch (error) {
          console.error("Failed to fetch report info:", error);
          toastError("Failed to load report. Please try again.");
        } finally {
          setLoadingReportCard(false);
        }
        return;
      }

      // If we have submissionId from route, we can use it directly
      // ReportId is optional in this case
      if (routeSubmissionId && !routeReportId) {
        try {
          setLoadingReportCard(true);
          setActualSubmissionId(routeSubmissionId);
          setKnownTestType(null); // Reset known test type, will be determined from API calls
          // Try to get report card from submissionId to get reportId and status
          const reportCard = await reportService.getReportCardBySubmissionId(
            routeSubmissionId
          );
          if (reportCard) {
            setReportId(reportCard.id);
            setReportStatus(reportCard.status);
            // Get testType from report card to avoid calling wrong API
            const testTypeFromCard =
              reportCard.test?.testType ||
              reportCard.reportData?.testInfo?.testType;
            if (testTypeFromCard) {
              setKnownTestType(testTypeFromCard as "ACHIEVEMENT" | "ADTM");
            }
          }
        } catch (error) {
          console.error("Failed to fetch report ID:", error);
        } finally {
          setLoadingReportCard(false);
        }
        return;
      }

      // If we have both, just set them and fetch report status
      if (routeReportId && routeSubmissionId) {
        setReportId(routeReportId);
        setActualSubmissionId(routeSubmissionId);
        setKnownTestType(null); // Reset known test type
        // Fetch report card to get status
        try {
          const reportCard = await reportService.getReportCardById(
            routeReportId
          );
          if (reportCard) {
            setReportStatus(reportCard.status);
          }
        } catch (error) {
          console.error("Failed to fetch report status:", error);
        }
        setLoadingReportCard(false);
      }
    };

    fetchReportInfo();
  }, [routeReportId, routeSubmissionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!actualSubmissionId) return;

    try {
      await generatePdfMutation.mutateAsync(actualSubmissionId);
      downloadPdf(actualSubmissionId);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  const handleApprove = async () => {
    const idToUse = reportId;

    if (!idToUse) {
      toastError("Report ID not available. Please wait for report to load.");
      return;
    }

    try {
      setApproving(true);

      await reportService.approveReport(idToUse, {
        comment: comment || undefined,
      });

      toastSuccess("Report approved successfully!");

      // Refresh report status after approve
      if (reportId) {
        try {
          const reportCard = await reportService.getReportCardById(reportId);
          if (reportCard) {
            setReportStatus(reportCard.status);
          }
        } catch (error) {
          console.error("Failed to refresh report status:", error);
        }
      }

      // Refresh data
      achievementQuery.refetch();
      adtmQuery.refetch();

      // Close modal and reset comment
      setShowCommentModal(false);
      setComment("");
    } catch (error: any) {
      console.error("Failed to approve:", error);
      toastError(error?.message || "Failed to approve report");
    } finally {
      setApproving(false);
    }
  };

  const handlePublish = async () => {
    const idToUse = reportId;

    if (!idToUse) {
      toastError("Report ID not available. Please wait for report to load.");
      return;
    }

    if (!confirm("Publish this report? Student will be able to view it.")) {
      return;
    }

    try {
      setPublishing(true);

      await reportService.publishReport(idToUse);
      toastSuccess("Report published successfully!");
      navigate("/teacher/reports");
    } catch (error: any) {
      console.error("Failed to publish:", error);
      toastError(error?.message || "Failed to publish report");
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (
    (isError || (!reportData && !isLoading)) &&
    !achievementQuery.isLoading &&
    !adtmQuery.isLoading
  ) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Report Not Found
            </h2>
            <p className="text-secondary-600 mb-4">
              The report you're looking for doesn't exist or couldn't be loaded.
              {achievementQuery.error && (
                <span className="block mt-2 text-sm text-red-600">
                  Achievement report error:{" "}
                  {achievementQuery.error?.message || "Unknown error"}
                </span>
              )}
              {adtmQuery.error && (
                <span className="block mt-2 text-sm text-red-600">
                  A-DTM report error:{" "}
                  {adtmQuery.error?.message || "Unknown error"}
                </span>
              )}
            </p>
            <Button onClick={() => navigate("/teacher/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData || !testType) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If A-DTM, use the enhanced report page component
  if (testType === "ADTM" && reportData && actualSubmissionId) {
    return (
      <>
        <AdtmReportPageForTeacher
          submissionId={actualSubmissionId}
          reportId={reportId}
          reportData={reportData as any}
          isLoading={adtmQuery.isLoading || loadingReportCard}
          error={adtmQuery.error}
          reportStatus={reportStatus}
          onApprove={() => {
            adtmQuery.refetch();
            // Refresh report status after approve
            if (reportId) {
              reportService.getReportCardById(reportId).then((card) => {
                setReportStatus(card.status);
              });
            }
          }}
        />
        {/* Comment Modal for A-DTM (handled inside AdtmReportPageForTeacher) */}
      </>
    );
  }

  // For Achievement tests, use the standard review page
  return (
    <div className="space-y-6 print:space-y-0">
      {/* Action Buttons - Hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate("/teacher/reports")}>
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
          {/* Show Approve button only if status is not APPROVED or PUBLISHED */}
          {reportStatus !== ReportStatus.APPROVED &&
            reportStatus !== ReportStatus.PUBLISHED && (
              <Button
                variant="secondary"
                onClick={() => setShowCommentModal(true)}
                disabled={approving}
                className="print:hidden"
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
            )}
          {/* Show Publish button only if status is APPROVED and not PUBLISHED */}
          {reportStatus === ReportStatus.APPROVED && (
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="print:hidden"
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Report Content */}
      {reportData && testType && (
        <div className="report-container">
          <AchievementReport reportData={reportData as any} />
        </div>
      )}

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

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setComment("");
        }}
        title="Approve Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add a comment for the student..."
              className="w-full"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowCommentModal(false);
                setComment("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={approving}>
              {approving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
