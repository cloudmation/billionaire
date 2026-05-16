import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, writeFile, appendFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { portfolioValueAtMarket } from "./game-data";
import type { BillMessage, GameProgressPayload, LeaderboardEntry } from "./types";

const dataDir = process.env.VERCEL ? path.join("/tmp", "billionaire-data") : path.join(process.cwd(), ".data");
const billLogFile = path.join(dataDir, "bill-interactions.jsonl");
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
let sqlClient: ReturnType<typeof neon> | null = null;
let schemaPromise: Promise<void> | null = null;

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

function getSql() {
  if (!databaseUrl) return null;
  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

function progressKey(userName = "Investor") {
  return userName.trim().toLowerCase() || "investor";
}

function progressFile(userName = "Investor") {
  const safeName = userName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return path.join(dataDir, `progress-${safeName || "investor"}.json`);
}

function portfolioValueFor(progress: GameProgressPayload) {
  return portfolioValueAtMarket(progress);
}

function leaderboardEntry(progress: GameProgressPayload, updatedAt: string) {
  const stockValue = portfolioValueFor(progress);
  return {
    rank: 0,
    userName: progress.userName?.trim() || "Investor",
    netWorth: (progress.cash ?? 0) + stockValue,
    cash: progress.cash ?? 0,
    stockValue,
    holdingsCount: progress.holdings?.length ?? 0,
    completedMissions: progress.completedMissions?.length ?? 0,
    quizCorrect: (progress.quizHistory ?? []).reduce((sum, quiz) => sum + quiz.correct, 0),
    checkInStreak: progress.checkInStreak ?? 0,
    updatedAt
  };
}

function rankLeaderboard(entries: Omit<LeaderboardEntry, "rank">[]) {
  return entries
    .sort((left, right) => right.netWorth - left.netWorth || left.userName.localeCompare(right.userName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

async function ensureDatabase() {
  const sql = getSql();
  if (!sql) return false;
  schemaPromise ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS player_progress (
        user_name TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        progress JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS bill_messages (
        id BIGSERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        screen TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })();
  await schemaPromise;
  return true;
}

export async function readProgress(userName?: string) {
  if (await ensureDatabase()) {
    const sql = getSql();
    if (!sql) return null;
    const rows = (await sql`
      SELECT progress
      FROM player_progress
      WHERE user_name = ${progressKey(userName)}
      LIMIT 1
    `) as Array<{ progress: GameProgressPayload }>;
    return rows[0]?.progress ?? null;
  }

  try {
    const payload = await readFile(progressFile(userName), "utf8");
    return JSON.parse(payload) as GameProgressPayload;
  } catch {
    return null;
  }
}

export async function writeProgress(progress: GameProgressPayload) {
  if (await ensureDatabase()) {
    const sql = getSql();
    if (!sql) return;
    await sql`
      INSERT INTO player_progress (user_name, display_name, progress, updated_at)
      VALUES (${progressKey(progress.userName)}, ${progress.userName.trim() || "Investor"}, ${JSON.stringify(progress)}::jsonb, NOW())
      ON CONFLICT (user_name)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        progress = EXCLUDED.progress,
        updated_at = NOW()
    `;
    return;
  }

  await ensureDataDir();
  await writeFile(progressFile(progress.userName), JSON.stringify(progress, null, 2), "utf8");
}

export async function readLeaderboard(limit = 25) {
  if (await ensureDatabase()) {
    const sql = getSql();
    if (!sql) return [];
    const rows = (await sql`
      SELECT progress, updated_at
      FROM player_progress
      ORDER BY updated_at DESC
      LIMIT 200
    `) as Array<{ progress: GameProgressPayload; updated_at: string | Date }>;

    return rankLeaderboard(
      rows.map((row) =>
        leaderboardEntry(
          row.progress,
          row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString()
        )
      )
    ).slice(0, limit);
  }

  try {
    await ensureDataDir();
    const files = await readdir(dataDir);
    const entries = await Promise.all(
      files
        .filter((file) => file.startsWith("progress-") && file.endsWith(".json"))
        .map(async (file) => {
          const filePath = path.join(dataDir, file);
          const [payload, fileStat] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
          return leaderboardEntry(JSON.parse(payload) as GameProgressPayload, fileStat.mtime.toISOString());
        })
    );
    return rankLeaderboard(entries).slice(0, limit);
  } catch {
    return [];
  }
}

export async function logBillMessages(messages: BillMessage[], screen?: string) {
  if (await ensureDatabase()) {
    const sql = getSql();
    if (!sql) return;
    const rows = messages.slice(-2).map((message) =>
      sql`
        INSERT INTO bill_messages (role, content, screen)
        VALUES (${message.role}, ${message.content.slice(0, 4000)}, ${screen ?? null})
      `
    );
    await sql.transaction(rows);
    return;
  }

  await ensureDataDir();
  const rows = messages.slice(-2).map((message) =>
    JSON.stringify({
      role: message.role,
      content: message.content.slice(0, 4000),
      screen: screen ?? null,
      createdAt: new Date().toISOString()
    })
  );
  await appendFile(billLogFile, `${rows.join("\n")}\n`, "utf8");
}
