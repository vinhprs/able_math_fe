import { Download, Printer, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast, toastError, toastSuccess } from "@/lib/toast";
import api from "@/lib/api";
import { useState } from "react";

interface ReportActionsProps {
  submissionId: string;
}

export function ReportActions({ submissionId }: ReportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);

      // Generate PDF first
      await api.post(`/reports/${submissionId}/generate-pdf`);

      // Download PDF using axios with responseType blob
      const response = await api.get(`/reports/${submissionId}/download-pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adtm-report-${submissionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toastSuccess("PDF report downloaded successfully");
    } catch (error) {
      console.error("Download PDF error:", error);
      toastError("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "A-DTM Report",
          text: "View my A-DTM report",
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          console.error("Share error:", error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast("Report link copied to clipboard", "success");
      } catch (error) {
        console.error("Clipboard error:", error);
        toastError("Failed to copy link");
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={handleDownloadPdf}
        variant="primary"
        disabled={isDownloading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </>
        )}
      </Button>

      <Button onClick={handlePrint} variant="outline" className="border-2">
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>

      <Button onClick={handleShare} variant="outline" className="border-2">
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
}
