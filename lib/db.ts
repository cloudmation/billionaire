import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import type { BillMessage, GameProgressPayload } from "./types";

const dataDir = path.join(process.cwd(), ".data");
const billLogFile = path.join(dataDir, "bill-interactions.jsonl");

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
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

export async function readProgress(userName?: string) {
  try {
    const payload = await readFile(progressFile(userName), "utf8");
    return JSON.parse(payload) as GameProgressPayload;
  } catch {
    return null;
  }
}

export async function writeProgress(progress: GameProgressPayload) {
  await ensureDataDir();
  await writeFile(progressFile(progress.userName), JSON.stringify(progress, null, 2), "utf8");
}

export async function logBillMessages(messages: BillMessage[], screen?: string) {
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
