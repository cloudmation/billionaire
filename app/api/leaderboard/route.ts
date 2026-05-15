import { NextResponse } from "next/server";
import { readLeaderboard } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(50, Math.max(5, Number(limitParam) || 25));
  return NextResponse.json({ leaders: await readLeaderboard(limit) });
}
