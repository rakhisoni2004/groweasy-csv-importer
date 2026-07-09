"use client";

import { useState } from "react";
import { ArrowLeft, Download, CheckCircle2, XCircle } from "lucide-react";
import { CrmRecord, SkippedRecord, CRM_FIELDS } from "@/lib/types";

interface ResultsTableProps {
  records: CrmRecord[];
  skipped: SkippedRecord[];
  totalReceived: number;
  onStartOver: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "text-teal border-teal/40 bg-teal-dim/30",
  DID_NOT_CONNECT: "text-slate border-ink-line bg-ink-line/40",
  BAD_LEAD: "text-clay border-clay/40 bg-clay-dim/30",
  SALE_DONE: "text-amber border-amber/40 bg-amber-dim/30",
};

function toCsv(records: CrmRecord[]): string {
  const header = CRM_FIELDS.join(",");
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = records.map((r) => CRM_FIELDS.map((f) => escape(r[f] ?? "")).join(","));
  return [header, ...lines].join("\n");
}

export function ResultsTable({ records, skipped, totalReceived, onStartOver }: ResultsTableProps) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");

  const downloadCsv = () => {
    const blob = new Blob([toCsv(records)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "groweasy-crm-import.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button
        onClick={onStartOver}
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-paper transition-colors"
      >
        <ArrowLeft size={14} /> Import another file
      </button>

      <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium text-paper">Import complete</h2>
          <p className="text-slate text-sm mt-1">{totalReceived.toLocaleString()} rows received</p>
        </div>
        <button
          onClick={downloadCsv}
          disabled={records.length === 0}
          className="inline-flex items-center gap-2 bg-amber text-ink font-display font-medium px-5 py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Download size={16} />
          Download CRM CSV
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-xl border border-ink-line bg-ink-raised px-5 py-4">
          <div className="flex items-center gap-2 text-teal">
            <CheckCircle2 size={16} />
            <span className="text-xs uppercase tracking-wide font-medium">Imported</span>
          </div>
          <p className="font-display text-3xl mt-1 text-paper">{records.length.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-ink-line bg-ink-raised px-5 py-4">
          <div className="flex items-center gap-2 text-clay">
            <XCircle size={16} />
            <span className="text-xs uppercase tracking-wide font-medium">Skipped</span>
          </div>
          <p className="font-display text-3xl mt-1 text-paper">{skipped.length.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-1 border-b border-ink-line">
        <button
          onClick={() => setTab("imported")}
          className={[
            "px-4 py-2 text-sm font-medium font-display border-b-2 -mb-px transition-colors",
            tab === "imported" ? "border-amber text-paper" : "border-transparent text-slate hover:text-paper",
          ].join(" ")}
        >
          Imported ({records.length})
        </button>
        <button
          onClick={() => setTab("skipped")}
          className={[
            "px-4 py-2 text-sm font-medium font-display border-b-2 -mb-px transition-colors",
            tab === "skipped" ? "border-clay text-paper" : "border-transparent text-slate hover:text-paper",
          ].join(" ")}
        >
          Skipped ({skipped.length})
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-ink-line bg-ink-raised overflow-hidden">
        <div className="max-h-[28rem] overflow-auto scroll-thin">
          {tab === "imported" ? (
            records.length === 0 ? (
              <p className="p-8 text-center text-slate text-sm">
                Nothing imported. Every row was missing both an email and a mobile number.
              </p>
            ) : (
              <table className="min-w-full text-sm font-data">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {CRM_FIELDS.map((f) => (
                      <th
                        key={f}
                        className="bg-ink-raised border-b border-ink-line text-left px-4 py-3 font-medium text-slate whitespace-nowrap"
                      >
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="odd:bg-ink even:bg-ink-raised/60">
                      {CRM_FIELDS.map((f) => (
                        <td key={f} className="px-4 py-2.5 whitespace-nowrap border-b border-ink-line/60">
                          {f === "crm_status" && r[f] ? (
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                                STATUS_COLORS[r[f]] ?? "text-slate border-ink-line"
                              }`}
                            >
                              {r[f]}
                            </span>
                          ) : (
                            <span className="text-paper/90">{r[f] || <span className="text-slate">—</span>}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : skipped.length === 0 ? (
            <p className="p-8 text-center text-slate text-sm">Nothing was skipped. Every row had an email or mobile number.</p>
          ) : (
            <table className="min-w-full text-sm font-data">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="bg-ink-raised border-b border-ink-line text-left px-4 py-3 font-medium text-slate">
                    Reason
                  </th>
                  <th className="bg-ink-raised border-b border-ink-line text-left px-4 py-3 font-medium text-slate">
                    Raw row
                  </th>
                </tr>
              </thead>
              <tbody>
                {skipped.map((s, i) => (
                  <tr key={i} className="odd:bg-ink even:bg-ink-raised/60 align-top">
                    <td className="px-4 py-2.5 whitespace-nowrap border-b border-ink-line/60 text-clay">{s.reason}</td>
                    <td className="px-4 py-2.5 border-b border-ink-line/60 text-paper/70 max-w-xl truncate">
                      {JSON.stringify(s.row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
