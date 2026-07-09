"use client";

import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";

interface ProcessingViewProps {
  status: "processing" | "error";
  totalRows: number;
  errorMessage?: string;
  onRetry?: () => void;
}

export function ProcessingView({ status, totalRows, errorMessage, onRetry }: ProcessingViewProps) {
  if (status === "error") {
    return (
      <div className="max-w-lg">
        <div className="flex items-center gap-3 text-clay">
          <AlertTriangle size={22} />
          <h2 className="font-display text-xl text-paper">Import failed</h2>
        </div>
        <p className="text-slate text-sm mt-3">
          {errorMessage ?? "Something went wrong while talking to the AI model."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 bg-ink-raised border border-ink-line text-paper font-display px-4 py-2 rounded-lg hover:border-slate transition-colors"
          >
            <RotateCcw size={15} /> Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 text-amber">
        <Loader2 size={22} className="animate-spin" />
        <h2 className="font-display text-xl text-paper">Mapping your columns…</h2>
      </div>
      <p className="text-slate text-sm mt-3">
        Sending {totalRows.toLocaleString()} row{totalRows === 1 ? "" : "s"} to Claude in batches, matching each
        column to a GrowEasy CRM field. Rows without an email or mobile number get flagged and skipped.
      </p>
      <div className="mt-6 h-1.5 w-full rounded-full bg-ink-line overflow-hidden">
        <div className="h-full w-1/3 bg-amber rounded-full animate-[loadingbar_1.4s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes loadingbar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
