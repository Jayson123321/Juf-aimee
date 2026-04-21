"use client";

import { Download } from "lucide-react";

export function SubmissionDownload({
  fileName,
  mimeType,
  base64,
}: {
  fileName: string;
  mimeType: string;
  base64: string;
}) {
  function handleDownload() {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
    >
      <Download className="size-3.5" />
      Downloaden
    </button>
  );
}
