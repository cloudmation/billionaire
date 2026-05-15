import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import type { BillMessage, GameProgressPayload } from "./types";

const dataDir = path.join(process.cwd(), ".data");
const progressFile = path.join(dataDir, "progress.json");
const billLogFile = path.join(dataDir, "bill-interactions.jsonl");

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

export async function readProgress() {
  try {
    const payload = await readFile(progressFile, "utf8");
    return JSON.parse(payload) as GameProgressPayload;
  } catch {
    return null;
  }
}

export async function writeProgress(progress: GameProgressPayload) {
  await ensureDataDir();
  await writeFile(progressFile, JSON.stringify(progress, null, 2), "utf8");
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
