import { Alert, Spinner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import type { AdtmReportData } from "@/types/reports.types";
import { CheckCircle, Eye, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReportActions } from "@/pages/reports/components/ReportActions";
import { ReportAnalysisPage } from "@/pages/reports/components/ReportAnalysisPage";
import { ReportCoverPage } from "@/pages/reports/components/ReportCoverPage";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { reportService } from "@/services/reportService";
import { toastSuccess, toastError } from "@/lib/toast";
import { ReportStatus } from "@/types/report";

interface AdtmReportPageForTeacherProps {
  submissionId: string;
  reportId: string | null;
  reportData: AdtmReportData | null;
  isLoading: boolean;
  error: any;
  reportStatus?: string | null;
  onApprove?: () => void;
}

export function AdtmReportPageForTeacher({
  submissionId,
  reportId,
  reportData,
  isLoading,
  error,
  reportStatus,
  onApprove,
}: AdtmReportPageForTeacherProps) {
  const navigate = useNavigate();
  const [approving, setApproving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);

  const handleApprove = async () => {
    if (!reportId) {
      toastError("Report ID not available. Please wait for report to load.");
      return;
    }

    try {
      setApproving(true);

      await reportService.approveReport(reportId, {
        comment: comment || undefined,
      });

      toastSuccess("Report approved successfully!");

      if (onApprove) {
        onApprove();
      }

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
    if (!reportId) {
      toastError("Report ID not available. Please wait for report to load.");
      return;
    }

    if (!confirm("Publish this report? Student will be able to view it.")) {
      return;
    }

    try {
      setPublishing(true);

      await reportService.publishReport(reportId);
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

  if (!reportData) return null;

  // Safety check for charts
  if (!reportData.charts) {
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
      <div className="min-h-screen bg-gray-100 print:bg-white">
        {/* Navigation Bar (hidden on print) */}
        <div className="sticky top-0 bg-white shadow-md p-4 flex items-center justify-between print:hidden z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/teacher/reports")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <ReportActions submissionId={submissionId} />
            {/* Show Approve button only if status is not APPROVED or PUBLISHED */}
            {reportStatus !== ReportStatus.APPROVED &&
              reportStatus !== ReportStatus.PUBLISHED && (
                <Button
                  variant="secondary"
                  onClick={() => setShowCommentModal(true)}
                  disabled={approving || !reportId}
                >
                  {approving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              )}
            {/* Show Publish button only if status is APPROVED and not PUBLISHED */}
            {reportStatus === ReportStatus.APPROVED && (
              <Button
                onClick={handlePublish}
                disabled={publishing || !reportId}
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Report Content */}
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
            studentName={reportData.student.name}
            testCode={
              reportData.test.testCode || `A-DTM Level ${reportData.test.level}`
            }
            sections={reportData.sections}
            overallScore={reportData.overallScore}
          />

          {/* Page 2: Analysis - Continue on same page */}
          <ReportAnalysisPage reportData={reportData} />
        </div>
      </div>

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
    </>
  );
}
