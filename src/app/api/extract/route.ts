import { NextRequest, NextResponse } from "next/server";
import { extractCrmRecords } from "@/lib/extract";
import { ExtractRequestBody, ExtractResponseBody } from "@/lib/types";

// AI batches can take a while on large files; give this route room to breathe on platforms that allow it.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
if (!process.env.GROQ_API_KEY) {
  return NextResponse.json(
    { error: "Server is missing GROQ_API_KEY. Add it to your environment variables." },
    { status: 500 }
  );
}

  let body: ExtractRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || !Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: "Request must include a non-empty 'rows' array" }, { status: 400 });
  }

  if (body.rows.length > 2000) {
    return NextResponse.json(
      { error: "This demo caps a single import at 2000 rows. Split your file and re-upload." },
      { status: 413 }
    );
  }

  try {
    const { records, skipped, batches } = await extractCrmRecords(body.rows);

    const response: ExtractResponseBody = {
      records,
      skipped,
      totalReceived: body.rows.length,
      totalImported: records.length,
      totalSkipped: skipped.length,
      batches,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Extraction failed:", err);
    return NextResponse.json({ error: "AI extraction failed. Please try again." }, { status: 502 });
  }
}
