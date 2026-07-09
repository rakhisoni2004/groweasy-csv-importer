"use client";

export type StageKey = "upload" | "preview" | "import";

const STAGES: { key: StageKey; label: string; hint: string }[] = [
  { key: "upload", label: "Upload", hint: "Drop any CSV export" },
  { key: "preview", label: "Preview", hint: "Check the raw rows" },
  { key: "import", label: "Import", hint: "AI maps it to CRM" },
];

export function Stepper({ current }: { current: StageKey }) {
  const currentIndex = STAGES.findIndex((s) => s.key === current);

  return (
    <nav
      aria-label="Import progress"
      className="flex md:flex-col gap-0 md:gap-8 md:pt-2"
    >
      {STAGES.map((stage, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "upcoming";
        return (
          <div key={stage.key} className="flex-1 md:flex-none flex md:items-start gap-3">
            <div className="flex flex-col items-center md:pt-1">
              <div
                className={[
                  "h-2.5 w-2.5 rounded-full shrink-0 transition-colors duration-300",
                  state === "done" && "bg-teal",
                  state === "active" && "bg-amber",
                  state === "upcoming" && "bg-ink-line",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {i < STAGES.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-ink-line mt-2" />
              )}
            </div>
            <div className="pb-1">
              <p
                className={[
                  "font-display font-medium text-sm tracking-wide uppercase",
                  state === "upcoming" ? "text-slate" : "text-paper",
                ].join(" ")}
              >
                {stage.label}
              </p>
              <p className="hidden md:block text-xs text-slate mt-0.5 max-w-[9rem]">
                {stage.hint}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
