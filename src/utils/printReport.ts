/**
 * Print only the report content, excluding sidebar, header, and other UI elements
 * @param containerSelector - CSS selector for the report container (default: '.report-container')
 */
export function printReport(
  containerSelector: string = ".report-container"
): void {
  // Get the report container element
  const reportContainer = document.querySelector(containerSelector);
  if (!reportContainer) {
    // Fallback to standard print if container not found
    window.print();
    return;
  }

  // Create a new window with only the report content
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Fallback if popup is blocked
    window.print();
    return;
  }

  // Get the report HTML
  const reportHtml = reportContainer.innerHTML;

  // Write HTML to print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Report Print</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: "맑은 고딕", "Malgun Gothic", sans-serif;
            font-size: 13px;
            color: #676a6c;
            line-height: 1.42857143;
            background: white;
            padding: 0;
          }
          @page {
            margin: 0;
          }
          @media print {
            body {
              background: white;
            }
            @page {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${reportHtml}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Optionally close window after printing
      // Note: Some browsers may not allow auto-close after print dialog
    }, 250);
  };
}
