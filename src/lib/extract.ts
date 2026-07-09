import OpenAI from "openai";
import {
  CRM_FIELDS,
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
  CrmRecord,
  RawCsvRow,
  SkippedRecord,
} from "./types";
import { BATCH_SIZE, MAX_RETRIES } from "./constants";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a precise data-mapping engine for the GrowEasy CRM.

You will receive an array of raw CSV rows as JSON objects. Column names vary wildly between uploads
(Facebook Lead Export, Google Ads Export, real-estate CRM exports, hand-made spreadsheets, etc).

Map every row into this CRM schema in the SAME ORDER.

Fields:
${CRM_FIELDS.join(", ")}

Rules:
- crm_status must be one of: ${CRM_STATUS_VALUES.join(", ")}
- data_source must be one of: ${DATA_SOURCE_VALUES.join(", ")}
- Never hallucinate values.
- Never swap phone/email.
- Keep all 15 fields.
- Unknown fields => ""
- Return ONLY JSON.

Format:
{
  "records":[ ... ]
}`;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function emptyRecord(): CrmRecord {
  return {
    created_at: "",
    name: "",
    email: "",
    country_code: "",
    mobile_without_country_code: "",
    company: "",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "",
    possession_time: "",
    description: "",
  };
}

function sanitizeRecord(raw: unknown): CrmRecord {
  const base = emptyRecord();

  if (!raw || typeof raw !== "object") return base;

  const r = raw as Record<string, unknown>;

  for (const field of CRM_FIELDS) {
    const value = r[field];

    if (typeof value === "string") {
      (base as any)[field] = value.trim();
    } else if (typeof value === "number") {
      (base as any)[field] = String(value);
    }
  }

  if (!CRM_STATUS_VALUES.includes(base.crm_status as never)) {
    base.crm_status = "";
  }

  if (!DATA_SOURCE_VALUES.includes(base.data_source as never)) {
    base.data_source = "";
  }

  return base;
}
 async function callGeminiForBatch(rows: RawCsvRow[]): Promise<CrmRecord[]> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Rows:\n${JSON.stringify(rows, null, 2)}`,
          },
        ],
        response_format: {
          type: "json_object",
        },
      });

      const text = response.choices[0]?.message?.content ?? "";

      const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");

      const parsed = JSON.parse(cleaned) as {
        records?: unknown[];
      };

      if (!parsed.records || !Array.isArray(parsed.records)) {
        throw new Error("Malformed response: missing records array");
      }

      const records = rows.map((_, idx) =>
        sanitizeRecord(parsed.records![idx])
      );

      return records;
    } catch (err) {
      lastError = err;

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unknown extraction error");
}
export interface ExtractionResult {
  records: CrmRecord[];
  skipped: SkippedRecord[];
  batches: number;
}

export async function extractCrmRecords(
  rows: RawCsvRow[]
): Promise<ExtractionResult> {
  const batches = chunk(rows, BATCH_SIZE);
  const allRecords: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    let batchResults: CrmRecord[];

    try {
      batchResults = await callGeminiForBatch(batch);
    } catch (err) {
      console.error(`Batch ${i + 1}/${batches.length} failed:`, err);

      for (const row of batch) {
        skipped.push({
          row,
          reason: "AI extraction failed for this batch after retries",
        });
      }

      continue;
    }

    batch.forEach((rawRow, idx) => {
      const record = batchResults[idx];

      const hasEmail = !!record.email;
      const hasMobile = !!record.mobile_without_country_code;

      if (!hasEmail && !hasMobile) {
        skipped.push({
          row: rawRow,
          reason: "No email or mobile number found",
        });
        return;
      }

      allRecords.push(record);
    });
  }

  return {
    records: allRecords,
    skipped,
    batches: batches.length,
  };
}