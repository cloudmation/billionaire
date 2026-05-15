import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import type { BillMessage, GameProgressPayload } from "./types";

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
