"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { RawCsvRow } from "@/lib/types";
import { MAX_PREVIEW_ROWS } from "@/lib/constants";

interface PreviewTableProps {
  fileName: string;
  columns: string[];
  rows: RawCsvRow[];
  onConfirm: () => void;
  onBack: () => void;
}

export function PreviewTable({ fileName, columns, rows, onConfirm, onBack }: PreviewTableProps) {
  const visibleRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const truncated = rows.length > MAX_PREVIEW_ROWS;

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-paper transition-colors"
      >
        <ArrowLeft size={14} /> Choose a different file
      </button>

      <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium text-paper">{fileName}</h2>
          <p className="text-slate text-sm mt-1">
            {rows.length.toLocaleString()} row{rows.length === 1 ? "" : "s"} · {columns.length} column
            {columns.length === 1 ? "" : "s"} detected
            {truncated && ` · showing first ${MAX_PREVIEW_ROWS.toLocaleString()} for preview`}
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="inline-flex items-center gap-2 bg-amber text-ink font-display font-medium px-5 py-2.5 rounded-lg hover:brightness-110 transition-all shrink-0 self-start md:self-auto"
        >
          <Sparkles size={16} />
          Confirm & run AI import
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-ink-line bg-ink-raised overflow-hidden">
        <div className="max-h-[26rem] overflow-auto scroll-thin">
          <table className="min-w-full text-sm font-data">
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="bg-ink-raised border-b border-ink-line text-left px-4 py-3 font-medium text-slate whitespace-nowrap"
                  >
                    {col || "(blank header)"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr key={i} className="odd:bg-ink even:bg-ink-raised/60">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap text-paper/90 border-b border-ink-line/60">
                      {row[col] || <span className="text-slate">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
