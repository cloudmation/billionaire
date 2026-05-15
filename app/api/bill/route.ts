import OpenAI from "openai";
import { NextResponse } from "next/server";
import { DEFAULT_YEAR, fmt, STOCKS } from "@/lib/game-data";
import { logBillMessages } from "@/lib/db";
import type { BillMessage, GameProgressPayload, Stock, TabId } from "@/lib/types";

export const runtime = "nodejs";

type BillContext = {
  screen: TabId;
  selectedStock?: Stock | null;
  progress: GameProgressPayload;
};

type BillBody = {
  messages?: BillMessage[];
  context?: BillContext;
};

const apiKey =
  process.env.OPENAI_API_TOKEN || process.env.OpenAI_API_TOKEN || process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

function holdingsLine(progress?: GameProgressPayload) {
  if (!progress?.holdings?.length) return "No current holdings.";
  const stocks = [...STOCKS, ...(progress.customStocks ?? [])];
  return progress.holdings
    .map((holding) => {
      const stock = stocks.find((candidate) => candidate.sym === holding.sym);
      return `${holding.shares} shares of ${holding.sym}${stock ? ` (${fmt(stock.price * holding.shares)})` : ""}`;
    })
    .join(", ");
}

function portfolioValueFor(progress?: GameProgressPayload) {
  const stocks = [...STOCKS, ...(progress?.customStocks ?? [])];
  return (progress?.holdings ?? []).reduce((sum, holding) => {
    const stock = stocks.find((candidate) => candidate.sym === holding.sym);
    return sum + (stock?.price ?? 0) * holding.shares;
  }, 0);
}

function buildInstructions(context?: BillContext) {
  const netWorth = (context?.progress?.cash ?? 0) + portfolioValueFor(context?.progress);
  const selected = context?.selectedStock
    ? `${context.selectedStock.sym} (${context.selectedStock.name}), price ${fmt(context.selectedStock.price)}, P/E ${
        context.selectedStock.pe ?? "not profitable"
      }, revenue growth ${context.selectedStock.growth}%`
    : "none";

  return `You are BILL, an AI investing coach inside BILLIONAIRE, a web game for a smart 12-year-old learning investing.

Tone:
- Knowledgeable older sibling, never condescending.
- Use simple language, but do not water down the concept.
- Ask "What do you think?" often before giving final answers.
- Never provide specific financial advice. Explain how investors reason.
- Keep normal answers to four short sentences or fewer.

Player context:
- Time Machine start year: ${context?.progress?.startYear ?? DEFAULT_YEAR}
- Player name: ${context?.progress?.userName ?? "Investor"}
- Player age: ${context?.progress?.playerAge ?? 12}
- Game mode: ${context?.progress?.gameMode === "live" ? "Live Market" : "Time Machine"}
- Current screen: ${context?.screen ?? "home"}
- Net worth: ${fmt(netWorth)}
- Cash: ${fmt(context?.progress?.cash ?? 0)}
- Check-in streak: ${context?.progress?.checkInStreak ?? 0} day(s)
- Last check-in date: ${context?.progress?.lastCheckInDate ?? "never"}
- Holdings: ${holdingsLine(context?.progress)}
- Custom tickers added by player: ${context?.progress?.customStocks?.map((stock) => `${stock.sym} (${stock.name})`).join(", ") || "none"}
- Selected stock: ${selected}
- Recent trades: ${
    context?.progress?.trades?.slice(0, 3).map((trade) => `${trade.action} ${trade.shares} ${trade.sym}`).join(", ") ||
    "none"
  }

If the user asks for a quiz, return brief setup text plus a quiz exactly inside tags:
[QUIZ]{"topic":"Topic Name","questions":[{"q":"Question?","opts":["A","B","C","D"],"a":0,"exp":"Why the correct answer works."}]}[/QUIZ]

Use the exact quiz shape. Do not wrap the JSON in Markdown.`;
}

function fallbackReply(messages: BillMessage[], context?: BillContext) {
  const last = messages.at(-1)?.content.toLowerCase() ?? "";
  const stock = context?.selectedStock;
  if (last.includes("quiz")) {
    return `Let's test the core idea before moving on.
[QUIZ]{"topic":"P/E Ratio","questions":[{"q":"If a stock has a P/E of 20, what does that mean?","opts":["You pay $20 for every $1 of yearly earnings","The stock costs $20","The company grew 20%","The dividend is 20%"],"a":0,"exp":"P/E compares price with earnings. A P/E of 20 means investors pay $20 for each $1 the company earns in a year."}]}[/QUIZ]`;
  }
  if (last.includes("portfolio") || last.includes("risk")) {
    return "Your biggest risk is concentration: a lot of your gains come from high-growth tech. That is not automatically bad, but it means one sector could move your whole net worth. A thoughtful investor asks: am I being paid enough for that risk?";
  }
  if (stock) {
    return `${stock.name} is interesting because its moat is ${stock.moat.toLowerCase()}. A value investor would compare the ${stock.pe ?? "unprofitable"} P/E to the durability of that moat, while a growth investor would focus on ${stock.growth}% revenue growth. What do you think matters more here: price discipline or future growth?`;
  }
  return "Today I would focus on one clean analysis, not a bunch of rushed trades. Pick a company you understand, choose one investing lens, and explain your reasoning in one sentence before you buy or skip.";
}

export async function POST(request: Request) {
  const body = (await request.json()) as BillBody;
  const messages = body.messages?.slice(-10) ?? [];
  const context = body.context;

  if (!messages.length) {
    return NextResponse.json({ error: "Missing messages." }, { status: 400 });
  }

  try {
    if (!client) throw new Error("OpenAI API key is not configured.");
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      instructions: buildInstructions(context),
      input: messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
      max_output_tokens: 700
    });

    const text = response.output_text?.trim() || fallbackReply(messages, context);
    await logBillMessages([...messages.slice(-1), { role: "assistant", content: text }], context?.screen);
    return NextResponse.json({ text, source: "openai" });
  } catch (error) {
    const text = fallbackReply(messages, context);
    await logBillMessages([...messages.slice(-1), { role: "assistant", content: text }], context?.screen);
    return NextResponse.json({
      text,
      source: "fallback",
      reason: error instanceof Error ? error.message : "Unknown OpenAI error"
    });
  }
}
