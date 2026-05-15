import { NextResponse } from "next/server";
import { readProgress, writeProgress } from "@/lib/db";
import type { GameProgressPayload } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ progress: await readProgress() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { progress?: GameProgressPayload };
  if (!body.progress) {
    return NextResponse.json({ error: "Missing progress payload." }, { status: 400 });
  }
  await writeProgress(body.progress);
  return NextResponse.json({ ok: true });
}
