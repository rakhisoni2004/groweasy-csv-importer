"use client";

import { useState } from "react";
import { Stepper, StageKey } from "@/components/Stepper";
import { UploadStep } from "@/components/UploadStep";
import { PreviewTable } from "@/components/PreviewTable";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsTable } from "@/components/ResultsTable";
import { CrmRecord, ExtractResponseBody, RawCsvRow, SkippedRecord } from "@/lib/types";

type Stage = "upload" | "preview" | "processing" | "error" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<RawCsvRow[]>([]);
  const [result, setResult] = useState<ExtractResponseBody | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const stepperStage: StageKey =
    stage === "upload" ? "upload" : stage === "preview" ? "preview" : "import";

  function handleParsed(parsedRows: RawCsvRow[], cols: string[], name: string) {
    setRows(parsedRows);
    setColumns(cols);
    setFileName(name);
    setStage("preview");
  }

  async function runImport() {
    setStage("processing");
    setErrorMessage(undefined);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, columns }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server responded with ${res.status}`);
      }

      const data: ExtractResponseBody = await res.json();
      setResult(data);
      setStage("results");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  function startOver() {
    setStage("upload");
    setRows([]);
    setColumns([]);
    setFileName("");
    setResult(null);
    setErrorMessage(undefined);
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-amber flex items-center justify-center">
              <span className="font-display font-bold text-ink text-sm">G</span>
            </div>
            <span className="font-display font-medium text-paper tracking-wide">GrowEasy</span>
          </div>
          <span className="text-xs text-slate font-data">CSV → CRM Importer</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        <div className="grid md:grid-cols-[10rem_1fr] gap-8 md:gap-14">
          <div className="md:sticky md:top-14 md:self-start">
            <Stepper current={stepperStage} />
          </div>

          <div>
            {stage === "upload" && <UploadStep onParsed={handleParsed} />}

            {stage === "preview" && (
              <PreviewTable
                fileName={fileName}
                columns={columns}
                rows={rows}
                onConfirm={runImport}
                onBack={startOver}
              />
            )}

            {stage === "processing" && <ProcessingView status="processing" totalRows={rows.length} />}

            {stage === "error" && (
              <ProcessingView
                status="error"
                totalRows={rows.length}
                errorMessage={errorMessage}
                onRetry={runImport}
              />
            )}

            {stage === "results" && result && (
              <ResultsTable
                records={result.records as CrmRecord[]}
                skipped={result.skipped as SkippedRecord[]}
                totalReceived={result.totalReceived}
                onStartOver={startOver}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
