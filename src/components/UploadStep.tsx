"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileWarning } from "lucide-react";
import { RawCsvRow } from "@/lib/types";

interface UploadStepProps {
  onParsed: (rows: RawCsvRow[], columns: string[], fileName: string) => void;
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
        setError("That doesn't look like a CSV file. Please upload a .csv export.");
        return;
      }

      setIsParsing(true);
      Papa.parse<RawCsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsParsing(false);
          if (!results.data.length) {
            setError("This CSV has no data rows to import.");
            return;
          }
          const columns = results.meta.fields ?? [];
          onParsed(results.data, columns, file.name);
        },
        error: (err) => {
          setIsParsing(false);
          setError(`Couldn't parse this file: ${err.message}`);
        },
      });
    },
    [onParsed]
  );

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl font-medium text-paper">
        Import leads, any shape they come in.
      </h1>
      <p className="text-slate mt-3 max-w-lg">
        Facebook exports, Google Ads exports, a spreadsheet your sales team hacked
        together at midnight — drop it below. AI reads the columns and maps them into
        GrowEasy CRM format automatically.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        className={[
          "mt-8 rounded-2xl border-2 border-dashed p-10 md:p-14 text-center cursor-pointer transition-colors duration-200",
          isDragging ? "border-amber bg-amber-dim/20" : "border-ink-line bg-ink-raised hover:border-slate",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <UploadCloud
          className={isParsing ? "mx-auto animate-pulse text-amber" : "mx-auto text-slate"}
          size={36}
          strokeWidth={1.5}
        />
        <p className="mt-4 font-display text-paper">
          {isParsing ? "Reading your file…" : "Drag & drop a CSV, or click to browse"}
        </p>
        <p className="text-sm text-slate mt-1">No processing happens yet — this is just a read.</p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 text-clay text-sm">
          <FileWarning size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
