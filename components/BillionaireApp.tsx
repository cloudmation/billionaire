"use client";

import clsx from "clsx";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  Clock3,
  Home,
  LineChart,
  LogOut,
  Lock,
  Minus,
  Plus,
  Rocket,
  Scale,
  Search,
  Send,
  Sparkles,
  Target,
  Trophy,
  Radio,
  RotateCcw,
  User,
  X,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONCEPTS,
  DEFAULT_YEAR,
  ERAS,
  fmt,
  fmtCompact,
  getMarketDate,
  getMarketStocks,
  getMarketYear,
  getMilestoneIndex,
  getMilestoneProgress,
  MILESTONES,
  MISSIONS,
  pct,
  PORTFOLIO_HISTORY,
  portfolioCost,
  QUIZ_POOL,
  QUIZ_CORRECT_REWARD,
  STYLES
} from "@/lib/game-data";
import { getActiveCheckInStreak, getDailyCheckInReward, getLocalDateKey, getNextCheckInStreak, useGameStore } from "@/lib/store";
import type {
  BillMessage,
  EraYear,
  GameMode,
  GameProgressPayload,
  InvestmentStyle,
  InvestmentStyleId,
  LeaderboardEntry,
  Quiz,
  QuizQuestion,
  Stock,
  TabId
} from "@/lib/types";

type WizardState = {
  stock: Stock;
  step: number;
  style: InvestmentStyleId | null;
  answer: number | null;
  action: "buy" | "sell" | "skip" | null;
  shares: number;
  confirmed: boolean;
  quiz: ActiveQuiz | null;
};

type ActiveQuiz = Quiz & {
  current: number;
  answers: number[];
  earned?: number;
  complete?: boolean;
};

type CustomTickerForm = {
  sym: string;
  name: string;
  sector: string;
  price: string;
  change: string;
};

const navItems: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "market", label: "Market", icon: BarChart3 },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "ladder", label: "Leaderboard", icon: Trophy }
];

const sectorColors = ["#d7a531", "#27c77b", "#55c7f7", "#a78bfa", "#fb8a3c", "#f05d5e"];
const SIDE_QUEST_DAILY_LIMIT = 3;

type SideQuestDefinition = {
  id: string;
  title: string;
  prompt: string;
  reward: number;
  placeholder: string;
  isMatch: (stock: Stock) => boolean;
};

const SIDE_QUESTS: SideQuestDefinition[] = [
  {
    id: "value-moat",
    title: "Value Moat Hunt",
    prompt: "Find a stock with a P/E under 25 and explain whether the moat is strong enough.",
    reward: 5000,
    placeholder: "Explain why the business can protect profits from competitors.",
    isMatch: (stock) => stock.pe !== null && stock.pe < 25
  },
  {
    id: "dividend-safety",
    title: "Dividend Safety Check",
    prompt: "Find a stock with a dividend yield above 1.5% and explain one risk to that dividend.",
    reward: 4000,
    placeholder: "Explain what could make the dividend safer or riskier.",
    isMatch: (stock) => stock.yield > 1.5
  },
  {
    id: "growth-quality",
    title: "Growth Quality Scan",
    prompt: "Find a stock growing revenue at least 15% and explain what could keep that growth going.",
    reward: 4500,
    placeholder: "Explain whether the growth looks durable or fragile.",
    isMatch: (stock) => stock.growth >= 15
  },
  {
    id: "risk-radar",
    title: "Risk Radar",
    prompt: "Find a stock with beta above 1.5 and explain why the risk might be worth it or not.",
    reward: 3500,
    placeholder: "Explain the risk in plain language and what you would watch.",
    isMatch: (stock) => stock.beta > 1.5
  },
  {
    id: "technical-pullback",
    title: "Chart Patience",
    prompt: "Find a stock with RSI under 50 and explain what signal you would wait for before buying.",
    reward: 3500,
    placeholder: "Explain what would make the chart setup look healthier.",
    isMatch: (stock) => stock.rsi < 50
  }
];

function StyleIcon({ style, size = 18 }: { style: InvestmentStyle; size?: number }) {
  const common = { size, strokeWidth: 2.4 };
  if (style.icon === "Scale") return <Scale {...common} />;
  if (style.icon === "Rocket") return <Rocket {...common} />;
  if (style.icon === "LineChart") return <LineChart {...common} />;
  if (style.icon === "Banknote") return <Banknote {...common} />;
  return <Zap {...common} />;
}

function progressPayload(snapshot: () => GameProgressPayload) {
  return snapshot();
}

function cleanBillText(raw: string) {
  return raw.replace(/\[\/?QUIZ\]/g, "").trim();
}

function extractQuiz(raw: string): { text: string; quiz: ActiveQuiz | null } {
  const match = raw.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
  if (!match) return { text: cleanBillText(raw), quiz: null };
  try {
    const parsed = JSON.parse(match[1]) as Quiz;
    return {
      text: cleanBillText(raw.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/, "")),
      quiz: { ...parsed, current: 0, answers: [] }
    };
  } catch {
    return { text: cleanBillText(raw.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/, "")), quiz: null };
  }
}

function leaderboardKey(name: string) {
  return name.trim().toLowerCase() || "investor";
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "just now";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatMarketDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatInlineText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function BillMessageContent({ content }: { content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) return null;

  return (
    <div className="bill-answer">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        return (
          <div className="bill-answer-block" key={`${block}-${blockIndex}`}>
            {lines.map((line, lineIndex) => {
              const isBullet = /^[-*]\s+/.test(line);
              const previousIsBullet = lineIndex > 0 && /^[-*]\s+/.test(lines[lineIndex - 1]);
              if (isBullet && previousIsBullet) return null;
              if (isBullet) {
                const listItems = [];
                for (let itemIndex = lineIndex; itemIndex < lines.length; itemIndex += 1) {
                  if (!/^[-*]\s+/.test(lines[itemIndex])) break;
                  listItems.push(lines[itemIndex]);
                }
                return (
                  <ul key={`${line}-${lineIndex}`}>
                    {listItems.map((item, itemIndex) => (
                      <li key={`${item}-${itemIndex}`}>{formatInlineText(item.replace(/^[-*]\s+/, ""))}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={`${line}-${lineIndex}`}>{formatInlineText(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function styleMetrics(stock: Stock, styleId: InvestmentStyleId) {
  if (styleId === "value") {
    return [
      {
        label: "P/E Ratio",
        value: stock.pe ? `${stock.pe}x` : "N/A",
        helper: "Industry avg: 24x",
        note: "Lower can mean cheaper, but quality businesses often earn premiums.",
        good: stock.pe !== null && stock.pe <= 30
      },
      {
        label: "Moat",
        value: stock.moat,
        helper: "Durability check",
        note: "A moat protects profits from competitors.",
        good: true
      },
      {
        label: "Margin of Safety",
        value: stock.pe && stock.pe < 25 ? "Roomy" : "Thin",
        helper: "Price discipline",
        note: "The less obvious the bargain, the more careful the analysis.",
        good: stock.pe !== null && stock.pe < 25
      }
    ];
  }
  if (styleId === "growth") {
    return [
      {
        label: "Revenue Growth",
        value: `+${stock.growth}%`,
        helper: "Year over year",
        note: "Growth investors want expanding sales with room to continue.",
        good: stock.growth >= 18
      },
      {
        label: "Market Runway",
        value: stock.growth > 25 ? "Huge" : "Medium",
        helper: "TAM lens",
        note: "The bigger the market, the longer great growth can last.",
        good: stock.growth > 15
      },
      {
        label: "Price Premium",
        value: stock.pe ? `${stock.pe}x P/E` : "No P/E",
        helper: "Risk check",
        note: "Fast growers can be expensive. The question is whether growth earns it.",
        good: stock.growth > 25
      }
    ];
  }
  if (styleId === "technical") {
    return [
      {
        label: "RSI",
        value: `${stock.rsi}`,
        helper: "30-70 is normal",
        note: "Above 70 can be overheated. Below 30 can be washed out.",
        good: stock.rsi >= 40 && stock.rsi <= 70
      },
      {
        label: "Volume",
        value: `${stock.volumeScore}/100`,
        helper: "Participation",
        note: "Strong moves matter more when many traders confirm them.",
        good: stock.volumeScore >= 65
      },
      {
        label: "52W Position",
        value: `${stock.fiftyTwoWeek}%`,
        helper: "Near high",
        note: "Stocks near highs often have strong demand, but pullbacks can be sharp.",
        good: stock.fiftyTwoWeek >= 75
      }
    ];
  }
  if (styleId === "dividend") {
    return [
      {
        label: "Dividend Yield",
        value: `${stock.yield}%`,
        helper: "Annual payment",
        note: "Yield shows the cash paid per dollar invested.",
        good: stock.yield >= 1.5
      },
      {
        label: "Growth",
        value: `+${stock.growth}%`,
        helper: "Funding power",
        note: "A growing business has more room to raise payouts.",
        good: stock.growth >= 6
      },
      {
        label: "Business Stability",
        value: stock.beta < 1 ? "Steady" : "Bumpy",
        helper: "Beta lens",
        note: "Income investors often prefer smoother businesses.",
        good: stock.beta < 1.2
      }
    ];
  }
  return [
    {
      label: "Relative Strength",
      value: `${Math.max(0, stock.change * 18).toFixed(0)}%`,
      helper: "Trend score",
      note: "Momentum starts with stocks outperforming their peers.",
      good: stock.change > 1
    },
    {
      label: "52W Position",
      value: `${stock.fiftyTwoWeek}%`,
      helper: "Breakout watch",
      note: "Near-high stocks can keep running if demand remains strong.",
      good: stock.fiftyTwoWeek > 80
    },
    {
      label: "Volume Surge",
      value: `${stock.volumeScore}/100`,
      helper: "Crowd check",
      note: "Volume confirms that the move is not just a tiny blip.",
      good: stock.volumeScore > 70
    }
  ];
}

function socraticQuestion(stock: Stock, style: InvestmentStyleId) {
  if (style === "value") {
    return `${stock.name}'s P/E is ${stock.pe ?? "not available"} versus a rough peer average of 24. How would a value investor read that?`;
  }
  if (style === "growth") {
    return `${stock.name} is growing revenue at ${stock.growth}% per year. Is that enough to justify a growth-investor premium?`;
  }
  if (style === "technical") {
    return `${stock.name}'s RSI is ${stock.rsi}. Does this look like a clean setup or a stock getting stretched?`;
  }
  if (style === "dividend") {
    return `${stock.name}'s dividend yield is ${stock.yield}%. Would an income investor care about this stock?`;
  }
  return `${stock.name} sits at ${stock.fiftyTwoWeek}% of its 52-week high. Is that momentum worth chasing?`;
}

function answerOptions(style: InvestmentStyleId) {
  if (style === "value") {
    return ["It looks undervalued", "It looks fairly valued", "It may be expensive"];
  }
  if (style === "growth") {
    return ["Elite growth", "Solid but not elite", "Too slow for growth"];
  }
  if (style === "technical") {
    return ["Clean uptrend", "Neutral setup", "Too stretched"];
  }
  if (style === "dividend") {
    return ["Strong income stock", "Maybe, but needs checks", "Not enough yield"];
  }
  return ["Strong momentum", "Some momentum", "Weak setup"];
}

function billTake(stock: Stock, style: InvestmentStyle) {
  if (style.id === "value") {
    return `${stock.name}'s valuation needs judgment. The P/E of ${stock.pe ?? "N/A"} is not automatically cheap, but the moat, ${stock.moat.toLowerCase()}, can justify paying up if earnings are durable. A value investor would ask whether the business quality is strong enough to offset a thinner margin of safety. What do you think: is the moat worth the premium?`;
  }
  if (style.id === "growth") {
    return `${stock.name} is growing revenue at ${stock.growth}% a year, which ${
      stock.growth > 20 ? "puts it in serious growth territory" : "is useful, though not explosive"
    }. Growth investors will pay higher prices when the market runway is large and execution is strong. The risk is simple: if growth slows, the premium can shrink fast.`;
  }
  if (style.id === "technical") {
    return `${stock.name}'s RSI of ${stock.rsi} and volume score of ${stock.volumeScore} show a ${
      stock.rsi > 70 ? "hot" : "workable"
    } technical setup. A chart-focused investor would wait for confirmation near support or a clean breakout. The key is not prediction; it is having a plan before the move.`;
  }
  if (style.id === "dividend") {
    return `${stock.name}'s ${stock.yield}% yield ${
      stock.yield >= 1.5 ? "starts to matter for income investors" : "is not the main reason to own it"
    }. Dividend investors also need payout safety and business durability. A high yield without durability can be a trap.`;
  }
  return `${stock.name} has a 52-week position score of ${stock.fiftyTwoWeek} and a volume score of ${stock.volumeScore}. Momentum investors like leadership, but they need exits because fast moves reverse fast. The question is whether the trend is still accelerating or already crowded.`;
}

function QuizCard({
  quiz,
  onAnswer,
  compact = false
}: {
  quiz: ActiveQuiz;
  onAnswer: (index: number) => void;
  compact?: boolean;
}) {
  const question = quiz.questions[quiz.current];
  const answered = quiz.answers[quiz.current] !== undefined;
  const answerCorrect = answered && question ? quiz.answers[quiz.current] === question.a : false;
  if (!question) {
    return (
      <div className="quiz-card">
        <div className="section-kicker gold">Quiz complete</div>
        <p className="muted" style={{ margin: "8px 0 0", fontSize: compact ? 12 : 14 }}>
          Nice work. BILL saved this to your learning history. You earned {fmt(quiz.earned ?? 0)} cash.
        </p>
      </div>
    );
  }
  return (
    <div className="quiz-card">
      <div className="section-kicker gold">
        Quiz {quiz.current + 1}/{quiz.questions.length} · {quiz.topic}
      </div>
      <div style={{ marginTop: 8, fontSize: compact ? 12 : 15, fontWeight: 800, lineHeight: 1.45 }}>
        {question.q}
      </div>
      {question.opts.map((option, index) => {
        const chosen = quiz.answers[quiz.current] === index;
        const correct = question.a === index;
        return (
          <button
            className={clsx("quiz-option", answered && correct && "correct", answered && chosen && !correct && "missed")}
            disabled={answered}
            key={option}
            onClick={() => onAnswer(index)}
            type="button"
          >
            {option}
          </button>
        );
      })}
      {answered ? (
        <>
          <div className={clsx("quiz-feedback", answerCorrect && "reward")}>
            {answerCorrect ? `Correct +${fmt(QUIZ_CORRECT_REWARD)} cash` : "No cash this time. Try the next one."}
          </div>
          <p className="muted" style={{ margin: "7px 0 0", fontSize: 12, lineHeight: 1.45 }}>
            {question.exp}
          </p>
        </>
      ) : null}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
  );
}

function SparklineSvg({
  data,
  secondary = false
}: {
  data: Array<{ year: string; value: number; sp?: number }>;
  secondary?: boolean;
}) {
  const width = 720;
  const height = 220;
  const pad = 18;
  const allValues = data.flatMap((item) => (secondary && item.sp ? [item.value, item.sp] : [item.value]));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = Math.max(1, max - min);
  const point = (value: number, index: number) => {
    const x = pad + (index / Math.max(1, data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  const primaryPoints = data.map((item, index) => point(item.value, index)).join(" ");
  const secondaryPoints = data.map((item, index) => point(item.sp ?? item.value, index)).join(" ");
  const areaPoints = `${pad},${height - pad} ${primaryPoints} ${width - pad},${height - pad}`;

  return (
    <svg aria-hidden="true" className="svg-chart" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d7a531" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#d7a531" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((line) => (
        <line
          key={line}
          stroke="#232832"
          strokeDasharray="4 8"
          strokeWidth="1"
          x1={pad}
          x2={width - pad}
          y1={pad + line * (height - pad * 2)}
          y2={pad + line * (height - pad * 2)}
        />
      ))}
      <polygon fill="url(#spark-fill)" points={areaPoints} />
      {secondary ? (
        <polyline fill="none" points={secondaryPoints} stroke="#55c7f7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      ) : null}
      <polyline fill="none" points={primaryPoints} stroke={secondary ? "#27c77b" : "#d7a531"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      {data.map((item, index) => {
        const [cx, cy] = point(item.value, index).split(",").map(Number);
        return <circle cx={cx} cy={cy} fill={secondary ? "#27c77b" : "#f0c76d"} key={item.year} r={index === data.length - 1 ? 6 : 3} />;
      })}
    </svg>
  );
}

function HoldingsBars({ holdings, stocks }: { holdings: GameProgressPayload["holdings"]; stocks: Stock[] }) {
  const items = holdings
    .map((holding) => {
      const stock = stocks.find((candidate) => candidate.sym === holding.sym);
      return {
        sym: holding.sym,
        value: (stock?.price ?? 0) * holding.shares
      };
    })
    .filter((item) => item.value > 0);
  if (!items.length) {
    return (
      <div className="empty-state">
        <strong>No stocks yet</strong>
        <span>Run an analysis in Market, then make your first trade.</span>
      </div>
    );
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="bar-list">
      {items.map((item, index) => (
        <div className="bar-row" key={item.sym}>
          <span>{item.sym}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                background: sectorColors[index % sectorColors.length],
                width: `${(item.value / max) * 100}%`
              }}
            />
          </div>
          <strong>{fmtCompact(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function AllocationBars({ allocation }: { allocation: Array<{ name: string; value: number }> }) {
  if (!allocation.length) {
    return (
      <div className="empty-state">
        <strong>No allocation yet</strong>
        <span>Your sectors will appear after your first buy.</span>
      </div>
    );
  }
  const total = allocation.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <div className="allocation-stack">
      {allocation.map((item, index) => (
        <div className="allocation-row" key={item.name}>
          <div className="space-between" style={{ fontSize: 13 }}>
            <span className="row">
              <span className="color-swatch" style={{ background: sectorColors[index % sectorColors.length] }} />
              <strong>{item.name}</strong>
            </span>
            <span className="muted">{Math.round((item.value / total) * 100)}%</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                background: sectorColors[index % sectorColors.length],
                width: `${(item.value / total) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BillionaireApp() {
  const hydrated = useGameStore((state) => state.hydrated);
  const hasOnboarded = useGameStore((state) => state.hasOnboarded);
  const userName = useGameStore((state) => state.userName);
  const playerAge = useGameStore((state) => state.playerAge);
  const gameMode = useGameStore((state) => state.gameMode);
  const startYear = useGameStore((state) => state.startYear);
  const journeyStartedAt = useGameStore((state) => state.journeyStartedAt);
  const cash = useGameStore((state) => state.cash);
  const lastCheckInDate = useGameStore((state) => state.lastCheckInDate);
  const checkInStreak = useGameStore((state) => state.checkInStreak);
  const holdings = useGameStore((state) => state.holdings);
  const customStocks = useGameStore((state) => state.customStocks);
  const completedMissions = useGameStore((state) => state.completedMissions);
  const studiedStyles = useGameStore((state) => state.studiedStyles);
  const trades = useGameStore((state) => state.trades);
  const quizHistory = useGameStore((state) => state.quizHistory);
  const sideQuestHistory = useGameStore((state) => state.sideQuestHistory);
  const loadProgress = useGameStore((state) => state.loadProgress);
  const buyStock = useGameStore((state) => state.buyStock);
  const sellStock = useGameStore((state) => state.sellStock);
  const setUserName = useGameStore((state) => state.setUserName);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const startNewJourney = useGameStore((state) => state.startNewJourney);
  const addCustomStock = useGameStore((state) => state.addCustomStock);
  const claimDailyCheckIn = useGameStore((state) => state.claimDailyCheckIn);
  const markStudied = useGameStore((state) => state.markStudied);
  const rewardCorrectQuizAnswer = useGameStore((state) => state.rewardCorrectQuizAnswer);
  const recordQuiz = useGameStore((state) => state.recordQuiz);
  const recordSideQuest = useGameStore((state) => state.recordSideQuest);
  const resetTodayProgress = useGameStore((state) => state.resetTodayProgress);
  const snapshot = useGameStore((state) => state.snapshot);

  const [tab, setTab] = useState<TabId>("home");
  const [sector, setSector] = useState("All");
  const [search, setSearch] = useState("");
  const [learnStyle, setLearnStyle] = useState<InvestmentStyleId | null>(null);
  const [wizard, setWizard] = useState<WizardState | null>(null);
  const [modePickerOpen, setModePickerOpen] = useState(false);
  const [billPanelOpen, setBillPanelOpen] = useState(false);
  const [addTickerOpen, setAddTickerOpen] = useState(false);
  const [switchUserOpen, setSwitchUserOpen] = useState(false);
  const [switchUserName, setSwitchUserName] = useState("");
  const [switchUserEra, setSwitchUserEra] = useState<EraYear>(DEFAULT_YEAR);
  const [switchUserError, setSwitchUserError] = useState("");
  const [switchingUser, setSwitchingUser] = useState(false);
  const [addTickerError, setAddTickerError] = useState("");
  const [sideQuestOpen, setSideQuestOpen] = useState(false);
  const [sideQuestStock, setSideQuestStock] = useState("");
  const [sideQuestAnswer, setSideQuestAnswer] = useState("");
  const [sideQuestError, setSideQuestError] = useState("");
  const [sideQuestLoading, setSideQuestLoading] = useState(false);
  const [customTickerForm, setCustomTickerForm] = useState<CustomTickerForm>({
    sym: "",
    name: "",
    sector: "",
    price: "",
    change: ""
  });
  const [onboardingStep, setOnboardingStep] = useState<"name" | "era">("name");
  const [onboardingName, setOnboardingName] = useState("");
  const [selectedEra, setSelectedEra] = useState<EraYear>(DEFAULT_YEAR);
  const [messages, setMessages] = useState<BillMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, I am BILL. Pick a stock, ask for a quiz, or hand me your portfolio and I will help you think it through."
    }
  ]);
  const [billInput, setBillInput] = useState("");
  const [billLoading, setBillLoading] = useState(false);
  const [billQuiz, setBillQuiz] = useState<ActiveQuiz | null>(null);
  const [wizardQuizLoading, setWizardQuizLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [displayNetWorth, setDisplayNetWorth] = useState(0);
  const [marketNow, setMarketNow] = useState(() => new Date());
  const loadedServer = useRef<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const todayKey = getLocalDateKey(marketNow);
  const allStocks = useMemo(() => {
    return getMarketStocks({ gameMode, startYear, journeyStartedAt, customStocks }, marketNow);
  }, [customStocks, gameMode, journeyStartedAt, marketNow, startYear]);
  const findStock = (sym: string) => allStocks.find((stock) => stock.sym === sym);
  const stockValue = useMemo(
    () =>
      holdings.reduce((sum, holding) => {
        const stock = allStocks.find((candidate) => candidate.sym === holding.sym);
        return sum + (stock?.price ?? 0) * holding.shares;
      }, 0),
    [allStocks, holdings]
  );
  const costBasis = useMemo(() => portfolioCost(holdings), [holdings]);
  const netWorth = cash + stockValue;
  const gain = stockValue - costBasis;
  const milestoneIndex = getMilestoneIndex(netWorth);
  const milestoneProgress = getMilestoneProgress(netWorth);
  const currentMilestone = MILESTONES[milestoneIndex];
  const nextMilestone = MILESTONES[milestoneIndex + 1];
  const selectedWizardStyle = wizard?.style ? STYLES.find((style) => style.id === wizard.style) ?? null : null;
  const isLiveMode = gameMode === "live";
  const marketDate = getMarketDate({ gameMode, startYear, journeyStartedAt }, marketNow);
  const marketYear = getMarketYear({ gameMode, startYear, journeyStartedAt }, marketNow);
  const formattedMarketDate = isLiveMode ? "Today" : formatMarketDate(marketDate);
  const currentEra = ERAS.find((era) => era.year === startYear) ?? ERAS.find((era) => era.year === DEFAULT_YEAR)!;
  const modeLabel = isLiveMode ? "Live Market" : `Time Machine · ${formattedMarketDate}`;
  const marketDateLabel = formattedMarketDate;
  const checkedInToday = lastCheckInDate === getLocalDateKey();
  const activeCheckInStreak = getActiveCheckInStreak(lastCheckInDate, checkInStreak);
  const nextCheckInStreak = getNextCheckInStreak(lastCheckInDate, checkInStreak);
  const availableCheckInReward = getDailyCheckInReward(nextCheckInStreak);
  const tomorrowCheckInReward = getDailyCheckInReward((checkedInToday ? Math.max(1, checkInStreak) : nextCheckInStreak) + 1);
  const leaderboardRows = useMemo(() => {
    const localEntry: LeaderboardEntry = {
      rank: 0,
      userName: userName.trim() || "Investor",
      netWorth,
      cash,
      stockValue,
      holdingsCount: holdings.length,
      completedMissions: completedMissions.length,
      quizCorrect: quizHistory.reduce((sum, quiz) => sum + quiz.correct, 0),
      checkInStreak,
      updatedAt: new Date().toISOString()
    };
    const byUser = new Map<string, LeaderboardEntry>();
    leaderboard.forEach((entry) => byUser.set(leaderboardKey(entry.userName), entry));
    byUser.set(leaderboardKey(localEntry.userName), localEntry);
    return Array.from(byUser.values())
      .sort((left, right) => right.netWorth - left.netWorth || left.userName.localeCompare(right.userName))
      .slice(0, 25)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [cash, checkInStreak, completedMissions.length, holdings.length, leaderboard, netWorth, quizHistory, stockValue, userName]);
  const answeredQuestionTexts = useMemo(
    () => new Set(quizHistory.flatMap((quiz) => quiz.questions ?? [])),
    [quizHistory]
  );

  useEffect(() => {
    const panel = chatScrollRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages, billLoading, billQuiz]);

  useEffect(() => {
    const timer = window.setInterval(() => setMarketNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const start = displayNetWorth || netWorth * 0.92;
    const delta = netWorth - start;
    let active = true;
    function tick() {
      frame += 1;
      const progress = Math.min(1, frame / 34);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (active) setDisplayNetWorth(start + delta * eased);
      if (progress < 1 && active) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netWorth]);

  useEffect(() => {
    if (!hydrated || !hasOnboarded) return;
    const progressKey = userName.trim() || "Investor";
    if (loadedServer.current === progressKey) return;
    loadedServer.current = progressKey;
    fetch(`/api/progress?userName=${encodeURIComponent(progressKey)}`)
      .then((response) => response.json())
      .then((data: { progress?: GameProgressPayload | null }) => {
        if (data.progress) loadProgress({ ...data.progress, userName: progressKey });
      })
      .catch(() => undefined);
  }, [hasOnboarded, hydrated, loadProgress, userName]);

  useEffect(() => {
    if (!hydrated || !hasOnboarded || switchingUser) return;
    const timer = window.setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: progressPayload(snapshot) })
      }).catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [
    cash,
    holdings,
    customStocks,
    completedMissions,
    studiedStyles,
    trades,
    quizHistory,
    sideQuestHistory,
    userName,
    gameMode,
    startYear,
    journeyStartedAt,
    lastCheckInDate,
    checkInStreak,
    switchingUser,
    hasOnboarded,
    hydrated,
    snapshot
  ]);

  useEffect(() => {
    if (!hydrated || !hasOnboarded || tab !== "ladder") return;
    let active = true;
    fetch("/api/leaderboard?limit=25")
      .then((response) => response.json())
      .then((data: { leaders?: LeaderboardEntry[] }) => {
        if (active) setLeaderboard(data.leaders ?? []);
      })
      .catch(() => {
        if (active) setLeaderboard([]);
      });
    return () => {
      active = false;
    };
  }, [hasOnboarded, hydrated, tab, cash, holdings, completedMissions, quizHistory, sideQuestHistory, checkInStreak, customStocks, gameMode, journeyStartedAt, startYear]);

  const sectors = useMemo(() => ["All", ...Array.from(new Set(allStocks.map((stock) => stock.sector)))], [allStocks]);
  const filteredStocks = useMemo(
    () =>
      allStocks.filter((stock) => {
        const sectorMatch = sector === "All" || stock.sector === sector;
        const textMatch =
          !search.trim() ||
          `${stock.sym} ${stock.name} ${stock.sector}`.toLowerCase().includes(search.trim().toLowerCase());
        return sectorMatch && textMatch;
      }),
    [allStocks, sector, search]
  );
  const todaysSideQuests = useMemo(
    () => sideQuestHistory.filter((quest) => getLocalDateKey(new Date(quest.createdAt)) === todayKey),
    [sideQuestHistory, todayKey]
  );
  const sideQuestLimitReached = todaysSideQuests.length >= SIDE_QUEST_DAILY_LIMIT;
  const activeSideQuest = sideQuestLimitReached ? null : SIDE_QUESTS[todaysSideQuests.length % SIDE_QUESTS.length];

  const allocation = useMemo(() => {
    const bySector = new Map<string, number>();
    holdings.forEach((holding) => {
      const stock = allStocks.find((candidate) => candidate.sym === holding.sym);
      if (!stock) return;
      bySector.set(stock.sector, (bySector.get(stock.sector) ?? 0) + stock.price * holding.shares);
    });
    return Array.from(bySector.entries()).map(([name, value]) => ({ name, value }));
  }, [allStocks, holdings]);

  function commitUserName(nextUserName: string) {
    const nextName = nextUserName.trim() || userName || "Investor";
    setUserName(nextName);
  }

  function finishOnboarding() {
    const nextName = onboardingName.trim() || "Investor";
    startNewJourney({ userName: nextName, startYear: selectedEra, playerAge: 12 });
    setMessages([
      {
        role: "assistant",
        content: `Welcome, ${nextName}. You are starting in ${selectedEra} with $1,000. First mission: pick one company you understand and explain it in one sentence.`
      }
    ]);
    setTab("home");
  }

  function openSwitchUser() {
    setSwitchUserName("");
    setSwitchUserEra(DEFAULT_YEAR);
    setSwitchUserError("");
    setSwitchUserOpen(true);
  }

  async function switchUser() {
    const nextName = switchUserName.trim();
    if (!nextName) {
      setSwitchUserError("Enter a username to switch.");
      return;
    }
    if (nextName.toLowerCase() === (userName.trim() || "Investor").toLowerCase()) {
      setSwitchUserError("You are already using that username.");
      return;
    }

    setSwitchUserError("");
    setSwitchingUser(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: progressPayload(snapshot) })
      }).catch(() => undefined);

      const response = await fetch(`/api/progress?userName=${encodeURIComponent(nextName)}`);
      const data = (await response.json()) as { progress?: GameProgressPayload | null };
      loadedServer.current = nextName;
      if (data.progress) {
        loadProgress({ ...data.progress, hasOnboarded: true, userName: nextName });
      } else {
        startNewJourney({ userName: nextName, startYear: switchUserEra, playerAge: 12 });
      }

      setMessages([
        {
          role: "assistant",
          content: data.progress
            ? `Welcome back, ${nextName}. I loaded your saved investing journey.`
            : `Welcome, ${nextName}. I started a fresh profile in ${switchUserEra} with $1,000.`
        }
      ]);
      setBillQuiz(null);
      setWizard(null);
      setAddTickerOpen(false);
      setModePickerOpen(false);
      setTab("home");
      setSwitchUserOpen(false);
    } catch {
      setSwitchUserError("I could not switch users. Try again.");
    } finally {
      setSwitchingUser(false);
    }
  }

  function updateCustomTickerForm(field: keyof CustomTickerForm, value: string) {
    setAddTickerError("");
    setCustomTickerForm((current) => ({ ...current, [field]: value }));
  }

  function submitCustomTicker() {
    const sym = customTickerForm.sym.toUpperCase().replace(/[^A-Z0-9.-]/g, "").slice(0, 8);
    const price = Number(customTickerForm.price);
    const change = Number(customTickerForm.change || 0);
    if (sym.length < 1) {
      setAddTickerError("Enter a ticker symbol.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setAddTickerError("Enter a positive price.");
      return;
    }
    if (!Number.isFinite(change)) {
      setAddTickerError("Change must be a number.");
      return;
    }

    const stock: Stock = {
      sym,
      name: customTickerForm.name.trim() || sym,
      mascot: sym.slice(0, 2),
      sector: customTickerForm.sector.trim() || "Custom",
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      pe: null,
      growth: 0,
      yield: 0,
      moat: "Needs research",
      desc: "Custom ticker added by the player. Research the business before trading.",
      since2010: 0,
      beta: 1,
      rsi: 50,
      volumeScore: 50,
      fiftyTwoWeek: 50
    };

    addCustomStock(stock);
    setSector("All");
    setSearch(stock.sym);
    setCustomTickerForm({ sym: "", name: "", sector: "", price: "", change: "" });
    setAddTickerOpen(false);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: `${stock.sym} is now in your Market list. Before trading it, ask: what does this company sell, and why might customers keep buying it?`
      }
    ]);
  }

  function handleDailyCheckIn() {
    const result = claimDailyCheckIn();
    if (!result.claimed) return;
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: `Nice check-in, ${userName || "Investor"} — you earned ${fmt(result.reward)} cash. Your streak is now ${result.streak} day${result.streak === 1 ? "" : "s"}.`
      }
    ]);
  }

  function openWizard(stock: Stock) {
    setWizard({
      stock,
      step: 0,
      style: null,
      answer: null,
      action: null,
      shares: 1,
      confirmed: false,
      quiz: null
    });
  }

  function updateWizard(next: Partial<WizardState>) {
    setWizard((current) => (current ? { ...current, ...next } : current));
  }

  function answerQuiz(source: "bill" | "wizard", index: number) {
    const setter = source === "bill" ? setBillQuiz : (quiz: ActiveQuiz | null) => updateWizard({ quiz });
    const currentQuiz = source === "bill" ? billQuiz : wizard?.quiz;
    if (!currentQuiz) return;
    const question = currentQuiz.questions[currentQuiz.current];
    if (!question || currentQuiz.answers[currentQuiz.current] !== undefined) return;
    const reward = index === question.a ? rewardCorrectQuizAnswer() : 0;
    const nextAnswers = [...currentQuiz.answers];
    nextAnswers[currentQuiz.current] = index;
    const nextQuiz = { ...currentQuiz, answers: nextAnswers, earned: (currentQuiz.earned ?? 0) + reward };
    setter(nextQuiz);
    window.setTimeout(() => {
      const nextIndex = nextQuiz.current + 1;
      if (nextIndex >= nextQuiz.questions.length) {
        const correct = nextQuiz.questions.reduce((sum, question, questionIndex) => {
          return sum + (nextAnswers[questionIndex] === question.a ? 1 : 0);
        }, 0);
        recordQuiz({
          topic: nextQuiz.topic,
          questions: nextQuiz.questions.map((question) => question.q),
          correct,
          total: nextQuiz.questions.length,
          reward: nextQuiz.earned ?? 0
        });
        setter({ ...nextQuiz, current: nextIndex, complete: true });
      } else {
        setter({ ...nextQuiz, current: nextIndex });
      }
    }, index === currentQuiz.questions[currentQuiz.current].a ? 900 : 1600);
  }

  async function sendBill(quick?: string) {
    const content = (quick ?? billInput).trim();
    if (!content || billLoading) return;
    setBillPanelOpen(true);
    setBillInput("");
    const outgoing = [...messages, { role: "user" as const, content }];
    setMessages(outgoing);
    setBillLoading(true);
    try {
      const response = await fetch("/api/bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoing,
          context: {
            screen: tab,
            selectedStock: wizard?.stock ?? null,
            progress: progressPayload(snapshot)
          }
        })
      });
      const data = (await response.json()) as { text?: string };
      const raw = data.text ?? "I lost my train of thought. Ask me again and I will pick it back up.";
      const parsed = extractQuiz(raw);
      if (parsed.quiz) setBillQuiz(parsed.quiz);
      setMessages([
        ...outgoing,
        {
          role: "assistant",
          content: parsed.text || `I made you a quick ${parsed.quiz?.topic ?? "investing"} quiz.`
        }
      ]);
    } catch {
      setMessages([
        ...outgoing,
        {
          role: "assistant",
          content:
            "I cannot reach the tutor service right now, but I can still help locally. Start with the company's moat, growth, and price."
        }
      ]);
    } finally {
      setBillLoading(false);
    }
  }

  function localQuizFallback(style: InvestmentStyleId, stock?: Stock | null): ActiveQuiz {
    const poolQuestions = QUIZ_POOL[style].questions.filter((question) => !answeredQuestionTexts.has(question.q));
    const baseQuestion = poolQuestions[0];
    const fallbackQuestion =
      baseQuestion ??
      (stock
        ? {
            q: `${stock.name} has a P/E of ${stock.pe ?? "N/A"}. What should an investor check before deciding it is cheap?`,
            opts: ["The moat and future profits", "Only the ticker symbol", "Whether the logo looks cool", "The stock price alone"],
            a: 0,
            exp: "A low-looking price only matters if the business can protect and grow profits."
          }
        : {
            q: "What makes a stock a stronger long-term investment candidate?",
            opts: ["A durable business and fair price", "A random rumor", "A funny ticker", "A one-day price jump only"],
            a: 0,
            exp: "Investors usually want both business quality and a price that makes sense."
          });

    return {
      topic: stock ? `${stock.sym} ${QUIZ_POOL[style].topic}` : QUIZ_POOL[style].topic,
      questions: [fallbackQuestion],
      current: 0,
      answers: []
    };
  }

  async function requestWizardQuiz(stock: Stock, style: InvestmentStyleId) {
    setWizardQuizLoading(true);
    try {
      const prompt = `Create a fresh 2-question micro-quiz for the trade I just made. Topic: ${style} investing. Stock: ${stock.sym} (${stock.name}). Do not repeat any previously answered question.`;
      const response = await fetch("/api/bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user" as const, content: prompt }],
          context: {
            screen: tab,
            selectedStock: stock,
            progress: progressPayload(snapshot)
          }
        })
      });
      const data = (await response.json()) as { text?: string };
      const parsed = extractQuiz(data.text ?? "");
      updateWizard({ quiz: parsed.quiz ?? localQuizFallback(style, stock) });
    } catch {
      updateWizard({ quiz: localQuizFallback(style, stock) });
    } finally {
      setWizardQuizLoading(false);
    }
  }

  async function submitSideQuest() {
    const quest = activeSideQuest;
    const stockSymbol = sideQuestStock.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
    const stock = findStock(stockSymbol);
    const answer = sideQuestAnswer.trim();
    if (!quest) {
      setSideQuestError("You hit today's side quest limit. Come back tomorrow for more.");
      return;
    }
    if (!stockSymbol) {
      setSideQuestError("Enter the ticker symbol you found in the Market.");
      return;
    }
    if (!stock) {
      setSideQuestError("I cannot find that ticker in the Market yet.");
      return;
    }
    if (!quest.isMatch(stock)) {
      setSideQuestError("That ticker does not match this quest. Check the Market metrics and try another symbol.");
      return;
    }
    if (answer.length < 20) {
      setSideQuestError("Write at least one full sentence explaining your reasoning.");
      return;
    }

    setSideQuestError("");
    setSideQuestLoading(true);
    setBillPanelOpen(true);
    const prompt = `Review my side quest answer in simple kid-friendly language. Side quest: ${quest.prompt} Stock I found: ${stock.sym} (${stock.name}). Metrics: P/E ${stock.pe ?? "N/A"}, yield ${stock.yield}%, growth ${stock.growth}%, beta ${stock.beta}, RSI ${stock.rsi}, moat: ${stock.moat}. My answer: ${answer}. Give me brief feedback and one next question.`;
    const outgoing = [...messages, { role: "user" as const, content: prompt }];
    setMessages(outgoing);
    try {
      const response = await fetch("/api/bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoing,
          context: {
            screen: tab,
            selectedStock: stock,
            progress: progressPayload(snapshot)
          }
        })
      });
      const data = (await response.json()) as { text?: string };
      recordSideQuest({
        questId: quest.id,
        stockSym: stock.sym,
        answer,
        reward: quest.reward
      });
      setMessages([
        ...outgoing,
        {
          role: "assistant",
          content: `${data.text ?? "Nice work. Keep asking whether the business can protect profits over time."}\n\nSide quest complete: +${fmt(quest.reward)} cash.`
        }
      ]);
      setSideQuestOpen(false);
      setSideQuestAnswer("");
      setSideQuestStock("");
    } catch {
      setSideQuestError("BILL could not review it yet. Try again in a moment.");
    } finally {
      setSideQuestLoading(false);
    }
  }

  function executeTrade() {
    if (!wizard?.action) return;
    if (wizard.action === "skip") {
      setWizard(null);
      return;
    }
    const style = wizard.style ?? "quick";
    if (wizard.action === "buy") {
      buyStock({ sym: wizard.stock.sym, shares: wizard.shares, price: wizard.stock.price, style });
    } else {
      sellStock({ sym: wizard.stock.sym, shares: wizard.shares, price: wizard.stock.price, style });
    }
    updateWizard({
      confirmed: true,
      quiz: null
    });
    void requestWizardQuiz(wizard.stock, style === "quick" ? "value" : style);
  }

  function chooseMode(nextMode: GameMode) {
    setGameMode(nextMode);
    setModePickerOpen(false);
    if (nextMode === "live") setTab("market");
  }

  const quickActions = [
    tab === "market" ? "Explain the P/E ratio using the stock list" : null,
    tab === "learn" ? "Quiz me on value investing" : null,
    tab === "portfolio" ? "What is my biggest portfolio risk?" : null,
    tab === "home" ? "What should I focus on today?" : null,
    "Give me a stock challenge"
  ].filter(Boolean) as string[];

  if (!hydrated) {
    return <div className="app onboarding-shell" />;
  }

  if (!hasOnboarded) {
    return renderOnboarding();
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <div className="brand-name">BILLIONAIRE</div>
            <div className="brand-sub">Investing simulator</div>
          </div>
        </div>
        <div className="milestone-strip">
          <button className="mode-pill mode-button" onClick={() => setModePickerOpen(true)} type="button">
            {isLiveMode ? <Radio size={14} /> : <Sparkles size={14} />}
            {modeLabel}
          </button>
          <div className="progress-rail" aria-label="Milestone progress">
            <div className="progress-fill" style={{ width: `${milestoneProgress * 100}%` }} />
          </div>
          <div className="tiny-pill">{nextMilestone ? nextMilestone.label : "Top"}</div>
        </div>
        <label className="user-chip">
          <User size={14} />
          <span>Player</span>
          <input
            aria-label="Player name"
            defaultValue={userName}
            key={userName}
            onBlur={(event) => commitUserName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
        </label>
        <button className="switch-user-button" onClick={openSwitchUser} type="button">
          <LogOut size={14} />
          Switch
        </button>
        <div className="stat-stack">
          <div className="stat-label">Net worth</div>
          <div className="stat-value">{fmt(displayNetWorth || netWorth)}</div>
        </div>
        <div className="tiny-pill">
          <Zap size={14} />
          {activeCheckInStreak} day streak
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          <nav className="nav" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={clsx("nav-button", tab === item.id && "active")}
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setLearnStyle(null);
                  }}
                  type="button"
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="side-section">
            <div className="space-between">
              <div className="section-kicker">Daily missions</div>
              <button className="text-button" onClick={resetTodayProgress} type="button">
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
            {MISSIONS.map((mission) => {
              const done = completedMissions.includes(mission.id);
              return (
                <div className="side-mission" key={mission.id}>
                  <span className={clsx("check-dot", done && "done")}>{done ? <Check size={12} /> : null}</span>
                  <span style={{ textDecoration: done ? "line-through" : "none" }}>{mission.text}</span>
                </div>
              );
            })}
          </div>

          <div className="side-section">
            <div className="section-kicker">Learning paths</div>
            {STYLES.slice(0, 4).map((style) => {
              const progress =
                style.id === "value" ? 68 : style.id === "growth" ? 32 : studiedStyles.includes(style.id) ? 20 : 0;
              return (
                <div className="path-row" key={style.id}>
                  <div className="path-icon" style={{ color: style.color }}>
                    <StyleIcon style={style} size={16} />
                  </div>
                  <div>
                    <div className="space-between" style={{ fontSize: 12, marginBottom: 5 }}>
                      <strong>{style.label}</strong>
                      <span className="muted">{progress}%</span>
                    </div>
                    <div className="mini-rail">
                      <div style={{ width: `${progress}%`, height: "100%", background: style.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />
          <div className="side-section">
            <div className="section-kicker">Trades left</div>
            <div className="display" style={{ color: "var(--green)", fontSize: 30, marginTop: 4 }}>
              {Math.max(0, 3 - trades.filter((trade) => trade.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length)} / 3
            </div>
          </div>
        </aside>

        <main className="main">
          {tab === "home" ? renderHome() : null}
          {tab === "market" ? renderMarket() : null}
          {tab === "learn" ? renderLearn() : null}
          {tab === "portfolio" ? renderPortfolio() : null}
          {tab === "ladder" ? renderLadder() : null}
        </main>

        {billPanelOpen ? <button aria-label="Close BILL panel" className="bill-drawer-backdrop" onClick={() => setBillPanelOpen(false)} type="button" /> : null}
        {renderBillPanel()}
      </div>

      <button className="bill-fab" onClick={() => setBillPanelOpen(true)} type="button">
        <Bot size={19} />
        Ask BILL
      </button>

      {modePickerOpen ? renderModePicker() : null}
      {wizard ? renderWizard() : null}
      {addTickerOpen ? renderAddTickerModal() : null}
      {switchUserOpen ? renderSwitchUserModal() : null}
    </div>
  );

  function renderBillPanel() {
    return (
      <aside className={clsx("bill-panel", billPanelOpen && "open")} aria-label="BILL AI investing coach">
        <div className="bill-header">
          <div className="row">
            <div className="bill-avatar">
              <Bot size={22} />
            </div>
            <div>
              <div className="display" style={{ color: "var(--gold)", fontSize: 22 }}>
                BILL
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                AI investing coach
              </div>
            </div>
            <div style={{ marginLeft: "auto" }} className="tiny-pill">
              Live
            </div>
            <button aria-label="Close BILL panel" className="icon-button bill-close" onClick={() => setBillPanelOpen(false)} type="button">
              <X size={17} />
            </button>
          </div>
          <div className="quick-actions">
            {quickActions.slice(0, 3).map((action) => (
              <button className="quick-action" key={action} onClick={() => sendBill(action)} type="button">
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-scroll" ref={chatScrollRef}>
          {messages.map((message, index) => (
            <div className={clsx("message-row", message.role === "user" && "user")} key={`${message.content}-${index}`}>
              {message.role === "assistant" ? (
                <div className="bill-avatar" style={{ width: 24, height: 24 }}>
                  <Bot size={14} />
                </div>
              ) : null}
              <div className={clsx("message", message.role)}>
                {message.role === "assistant" ? <BillMessageContent content={message.content} /> : message.content}
              </div>
            </div>
          ))}
          {billLoading ? (
            <div className="message-row">
              <div className="bill-avatar" style={{ width: 24, height: 24 }}>
                <Bot size={14} />
              </div>
              <div className="message assistant muted">Thinking...</div>
            </div>
          ) : null}
          {billQuiz ? <QuizCard compact onAnswer={(index) => answerQuiz("bill", index)} quiz={billQuiz} /> : null}
        </div>

        <form
          className="bill-input"
          onSubmit={(event) => {
            event.preventDefault();
            sendBill();
          }}
        >
          <div className="chat-form">
            <input
              className="input"
              onChange={(event) => setBillInput(event.target.value)}
              placeholder="Ask BILL anything..."
              value={billInput}
            />
            <button aria-label="Send message" className="icon-button" disabled={billLoading} type="submit">
              <Send size={17} />
            </button>
          </div>
        </form>
      </aside>
    );
  }

  function renderAddTickerModal() {
    const normalizedSymbol = customTickerForm.sym.toUpperCase().replace(/[^A-Z0-9.-]/g, "").slice(0, 8);
    const existing = normalizedSymbol ? allStocks.find((stock) => stock.sym === normalizedSymbol) : null;

    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <section className="ticker-dialog">
          <div className="space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="section-kicker gold">Custom market ticker</div>
              <h2 className="page-title" style={{ marginTop: 6 }}>
                Add a ticker
              </h2>
              <p className="page-subtitle">Add a company snapshot to your Market list, then run the Analysis Wizard before trading.</p>
            </div>
            <button aria-label="Close add ticker" className="icon-button" onClick={() => setAddTickerOpen(false)} type="button">
              <X size={18} />
            </button>
          </div>

          <form
            className="ticker-form"
            onSubmit={(event) => {
              event.preventDefault();
              submitCustomTicker();
            }}
          >
            <label className="form-label">
              Ticker
              <input
                autoFocus
                className="input"
                maxLength={8}
                onChange={(event) => updateCustomTickerForm("sym", event.target.value.toUpperCase())}
                placeholder="MSFT"
                value={customTickerForm.sym}
              />
            </label>
            <label className="form-label">
              Company name
              <input
                className="input"
                onChange={(event) => updateCustomTickerForm("name", event.target.value)}
                placeholder="Microsoft"
                value={customTickerForm.name}
              />
            </label>
            <label className="form-label">
              Sector
              <input
                className="input"
                onChange={(event) => updateCustomTickerForm("sector", event.target.value)}
                placeholder="Tech"
                value={customTickerForm.sector}
              />
            </label>
            <label className="form-label">
              Price
              <input
                className="input"
                inputMode="decimal"
                onChange={(event) => updateCustomTickerForm("price", event.target.value)}
                placeholder="100.00"
                value={customTickerForm.price}
              />
            </label>
            <label className="form-label">
              Today&apos;s change %
              <input
                className="input"
                inputMode="decimal"
                onChange={(event) => updateCustomTickerForm("change", event.target.value)}
                placeholder="0"
                value={customTickerForm.change}
              />
            </label>

            {existing ? (
              <div className="panel-block muted" style={{ padding: 12 }}>
                {existing.sym} is already in the market list. Saving will update your custom copy if it is one you added.
              </div>
            ) : null}
            {addTickerError ? <div className="form-error">{addTickerError}</div> : null}

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="plain-button" onClick={() => setAddTickerOpen(false)} type="button">
                Cancel
              </button>
              <button className="primary-button" type="submit">
                Add ticker
                <Plus size={17} />
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  function renderOnboarding() {
    const nameReady = onboardingName.trim().length > 0;

    return (
      <div className="app onboarding-shell">
        <section className="onboarding-panel">
          <div className="brand" style={{ marginBottom: 42 }}>
            <div className="brand-mark">B</div>
            <div>
              <div className="brand-name">BILLIONAIRE</div>
              <div className="brand-sub">New player setup</div>
            </div>
          </div>

          {onboardingStep === "name" ? (
            <div className="onboarding-stage fade-in">
              <div className="section-kicker gold">Player profile</div>
              <h1 className="onboarding-title">Pick your investor name</h1>
              <p className="onboarding-copy">
                Build an investing portfolio from $1,000. BILL keeps it simple, tracks your progress, and coaches every move.
              </p>
              <label className="onboarding-label">
                Player name
                <input
                  autoFocus
                  className="onboarding-input"
                  onChange={(event) => setOnboardingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && nameReady) setOnboardingStep("era");
                  }}
                  placeholder="Sophia"
                  value={onboardingName}
                />
              </label>
              <div className="onboarding-facts">
                <span>Beginner friendly</span>
                <span>$1,000 starter stack</span>
                <span>AI coach unlocked</span>
              </div>
              <button className="primary-button onboarding-cta" disabled={!nameReady} onClick={() => setOnboardingStep("era")} type="button">
                Choose era
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="onboarding-stage fade-in">
              <button className="onboarding-back" onClick={() => setOnboardingStep("name")} type="button">
                <ChevronLeft size={18} />
                Back
              </button>
              <h1 className="onboarding-title">Choose your era</h1>
              <p className="onboarding-copy">Each starting year tells a different story.</p>

              <div className="era-list">
                {ERAS.map((era) => {
                  const active = selectedEra === era.year;
                  return (
                    <button className={clsx("era-card", active && "active")} key={era.year} onClick={() => setSelectedEra(era.year)} type="button">
                      <div className="era-year">{era.year}</div>
                      <div className="era-info">
                        <div className="space-between">
                          <strong>{era.title}</strong>
                          {era.recommended ? <span className="recommended-pill">Recommended</span> : null}
                        </div>
                        <p>{era.desc}</p>
                        <div className="row">
                          <span className={clsx("difficulty-pill", era.tone)}>{era.difficulty}</span>
                          <span className="muted">$1,000 starting cash</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button className="primary-button onboarding-cta" onClick={finishOnboarding} type="button">
                Start in {selectedEra}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  function renderSwitchUserModal() {
    const switchReady = switchUserName.trim().length > 0 && !switchingUser;
    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <section className="switch-dialog">
          <div className="space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="section-kicker gold">Switch profile</div>
              <h2 className="page-title" style={{ marginTop: 6 }}>
                Log out and switch
              </h2>
              <p className="page-subtitle">
                Your current progress saves first. Existing usernames load their saved game; new usernames start fresh.
              </p>
            </div>
            <button aria-label="Close switch user" className="icon-button" onClick={() => setSwitchUserOpen(false)} type="button">
              <X size={18} />
            </button>
          </div>

          <form
            className="switch-form"
            onSubmit={(event) => {
              event.preventDefault();
              switchUser();
            }}
          >
            <label className="form-label">
              Username
              <input
                autoFocus
                className="input"
                onChange={(event) => {
                  setSwitchUserError("");
                  setSwitchUserName(event.target.value);
                }}
                placeholder="Ava"
                value={switchUserName}
              />
            </label>
            <label className="form-label">
              Starting era for a new profile
              <select
                className="input"
                onChange={(event) => setSwitchUserEra(Number(event.target.value) as EraYear)}
                value={switchUserEra}
              >
                {ERAS.map((era) => (
                  <option key={era.year} value={era.year}>
                    {era.year} · {era.title}
                  </option>
                ))}
              </select>
            </label>
            {switchUserError ? <div className="form-error">{switchUserError}</div> : null}
            <div className="switch-actions">
              <button className="plain-button" onClick={() => setSwitchUserOpen(false)} type="button">
                Cancel
              </button>
              <button className="primary-button" disabled={!switchReady} type="submit">
                {switchingUser ? "Switching..." : "Switch user"}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  function renderModePicker() {
    const cards = [
      {
        id: "time-machine" as const,
        icon: Clock3,
        title: "Time Machine",
        subtitle: `Start in ${startYear} with real market history`,
        bullets: [
          "Every 5-6 minutes unlocks the next real trading day",
          `Discover what $1K in Apple ${startYear} becomes`,
          "Feel every crash and every comeback"
        ]
      },
      {
        id: "live" as const,
        icon: Radio,
        title: "Live Market",
        subtitle: "Today's market lens with BILL coaching",
        bullets: [
          "Use the current watchlist as today's market board",
          "3 trades per day — choose wisely",
          "BILL answers in live-market context"
        ]
      }
    ];

    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <section className="mode-dialog">
          <div className="space-between" style={{ marginBottom: 20 }}>
            <div>
              <div className="section-kicker gold">Choose mode</div>
              <h2 className="page-title" style={{ marginTop: 4 }}>
                Market Mode
              </h2>
            </div>
            <button aria-label="Close mode picker" className="icon-button" onClick={() => setModePickerOpen(false)} type="button">
              <X size={18} />
            </button>
          </div>
          <div className="mode-card-stack">
            {cards.map((card) => {
              const Icon = card.icon;
              const active = gameMode === card.id;
              return (
                <button
                  className={clsx("mode-card", active && "active")}
                  key={card.id}
                  onClick={() => chooseMode(card.id)}
                  type="button"
                >
                  <div className="mode-card-head">
                    <div className="mode-card-icon">
                      <Icon size={34} />
                    </div>
                    <div>
                      <div className="display" style={{ color: active ? "var(--gold-2)" : "var(--text)", fontSize: 42 }}>
                        {card.title}
                      </div>
                      <p className="muted" style={{ margin: 0, fontSize: 18 }}>
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="mode-bullets">
                    {card.bullets.map((bullet) => (
                      <div className="mode-bullet" key={bullet}>
                        <ArrowRight size={18} />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="muted" style={{ margin: "20px 0 0", textAlign: "center" }}>
            New to investing? Start with Time Machine.
          </p>
        </section>
      </div>
    );
  }

  function renderHome() {
    const statCards = [
      { label: "Cash", value: fmt(cash), color: "var(--text)" },
      { label: "Investments", value: fmt(stockValue), color: "var(--cyan)" },
      { label: "Gain/Loss", value: `${gain >= 0 ? "+" : ""}${fmt(gain)}`, color: gain >= 0 ? "var(--green)" : "var(--red)" },
      {
        label: "Next level",
        value: nextMilestone ? `${fmtCompact(nextMilestone.amount - netWorth)} away` : "Complete",
        color: "var(--gold-2)"
      }
    ];
    return (
      <div className="fade-in stack">
        <div className="hero-grid">
          <section className="hero-card">
            <div>
              <div className="section-kicker gold">Your net worth · {isLiveMode ? "Live Market" : formattedMarketDate}</div>
              <div className="hero-number">{fmt(displayNetWorth || netWorth)}</div>
              <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
                <span className="green" style={{ fontWeight: 900 }}>
                  +{fmt(2841)} today
                </span>
                <span className="muted">Current rank: {currentMilestone.title}</span>
              </div>
            </div>
            <div className="chart-frame" style={{ height: 160 }}>
              <SparklineSvg data={PORTFOLIO_HISTORY} />
            </div>
          </section>

          <section className="card">
            <div className="section-kicker gold">{isLiveMode ? "Market mode" : `Time Machine date · ${formattedMarketDate}`}</div>
            <h2 className="display" style={{ fontSize: 44, margin: "8px 0 4px", color: "rgba(240,199,109,0.9)" }}>
              {isLiveMode ? "LIVE" : marketYear}
            </h2>
            <p style={{ margin: 0, lineHeight: 1.65 }}>
              {isLiveMode
                ? "Live Market mode keeps the game focused on today: prices, watchlist decisions, and BILL's current-market coaching."
                : currentEra.desc}
            </p>
            <div className="panel-block" style={{ marginTop: 15, padding: 12 }}>
              <div className="section-kicker">BILL's note</div>
              <p className="muted" style={{ margin: "7px 0 0", lineHeight: 1.55, fontSize: 13 }}>
                {isLiveMode
                  ? "Use the same discipline as Time Machine: pick one lens, name the risk, then decide whether the trade deserves capital."
                  : `${currentEra.title} began in ${startYear}. A new real trading day appears about every 5-6 minutes.`}
              </p>
            </div>
          </section>
        </div>

        <div className="grid-4">
          {statCards.map((stat) => (
            <div className="card" key={stat.label}>
              <div className="section-kicker">{stat.label}</div>
              <div className="display" style={{ color: stat.color, fontSize: 28, marginTop: 6 }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <section className="card checkin-card">
          <div>
            <div className="section-kicker gold">Daily check-in</div>
            <h2 className="display" style={{ color: checkedInToday ? "var(--green)" : "var(--gold-2)", fontSize: 36, margin: "8px 0 4px" }}>
              {checkedInToday ? "Checked in today" : `Claim ${fmt(availableCheckInReward)}`}
            </h2>
            <p className="muted" style={{ lineHeight: 1.55, margin: 0 }}>
              {checkedInToday
                ? `Come back tomorrow for ${fmt(tomorrowCheckInReward)}.`
                : `Keep showing up. Today becomes day ${nextCheckInStreak} of your streak.`}
            </p>
          </div>
          <div className="checkin-actions">
            <span className="mode-pill">
              <Zap size={14} />
              {activeCheckInStreak} day streak
            </span>
            <button className="success-button" disabled={checkedInToday} onClick={handleDailyCheckIn} type="button">
              {checkedInToday ? "Claimed" : "Check in"}
              <Check size={17} />
            </button>
          </div>
        </section>

        <div className="grid-2">
          <section className="card">
            <div className="space-between">
              <div className="section-kicker">Daily missions</div>
              <button className="text-button" onClick={resetTodayProgress} type="button">
                <RotateCcw size={12} />
                Reset today
              </button>
            </div>
            {MISSIONS.map((mission) => {
              const done = completedMissions.includes(mission.id);
              return (
                <div className="space-between" key={mission.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <div className="row">
                    <span className={clsx("check-dot", done && "done")}>{done ? <Check size={12} /> : null}</span>
                    <div>
                      <strong style={{ color: done ? "var(--muted)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                        {mission.text}
                      </strong>
                      <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                        {mission.concept}
                      </div>
                    </div>
                  </div>
                  <span className="gold" style={{ fontWeight: 900 }}>
                    +{fmtCompact(mission.reward)}
                  </span>
                </div>
              );
            })}
          </section>

          <section className="card">
            <div className="section-kicker">Portfolio</div>
            <div className="chart-frame" style={{ height: 210 }}>
              <HoldingsBars holdings={holdings} stocks={allStocks} />
            </div>
          </section>
        </div>
      </div>
    );
  }

  function renderMarket() {
    return (
      <div className="fade-in">
        <div className="space-between" style={{ alignItems: "flex-start", marginBottom: 4 }}>
          <SectionHeader title={`Market · ${marketDateLabel}`} subtitle="Pick a company, run the wizard, then make the move." />
          <div className="row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="plain-button" onClick={() => setAddTickerOpen(true)} type="button">
              <Plus size={16} />
              Add ticker
            </button>
            <div className="mode-pill">
              {isLiveMode ? <Radio size={14} /> : <Target size={14} />}
              {isLiveMode ? "Live Market" : "3 trades/day"}
            </div>
          </div>
        </div>

        <div className="filter-row">
          <div style={{ position: "relative", minWidth: 230 }}>
            <Search size={16} style={{ left: 11, position: "absolute", top: 11, color: "var(--muted-2)" }} />
            <input
              className="input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a ticker"
              style={{ paddingLeft: 34 }}
              value={search}
            />
          </div>
          {sectors.map((item) => (
            <button className={clsx("filter-chip", sector === item && "active")} key={item} onClick={() => setSector(item)} type="button">
              {item}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {filteredStocks.map((stock) => {
            const owned = holdings.find((holding) => holding.sym === stock.sym);
            const isCustom = customStocks.some((candidate) => candidate.sym === stock.sym);
            return (
              <button className="stock-card" key={stock.sym} onClick={() => openWizard(stock)} type="button">
                {owned ? <div className="owned-pill">Owned</div> : null}
                {isCustom && !owned ? <div className="owned-pill custom">Custom</div> : null}
                <div className="row">
                  <div className="ticker-badge">{stock.mascot}</div>
                  <div>
                    <div className="display" style={{ fontSize: 24 }}>
                      {stock.sym}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {stock.name} · {stock.sector}
                    </div>
                  </div>
                </div>
                <div className="space-between" style={{ marginTop: 18 }}>
                  <div className="display" style={{ fontSize: 30 }}>
                    {fmt(stock.price)}
                  </div>
                  <div className={stock.change >= 0 ? "green" : "red"} style={{ fontWeight: 900 }}>
                    {pct(stock.change)}
                  </div>
                </div>
                <p className="muted" style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.45 }}>
                  {stock.desc}
                </p>
                {stock.since2010 !== 0 ? (
                  <div className="gold" style={{ marginTop: 10, fontSize: 12, fontWeight: 900 }}>
                    Run so far: {stock.since2010 >= 0 ? "+" : ""}
                    {stock.since2010.toLocaleString()}%
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
        {!filteredStocks.length ? (
          <div className="empty-state" style={{ minHeight: 180 }}>
            <strong>No tickers found</strong>
            <span>Add a ticker or clear the search to keep exploring.</span>
          </div>
        ) : null}
      </div>
    );
  }

  function renderLearn() {
    if (learnStyle) {
      const style = STYLES.find((candidate) => candidate.id === learnStyle)!;
      const concepts = CONCEPTS[learnStyle];
      return (
        <div className="fade-in stack">
          <button className="plain-button" onClick={() => setLearnStyle(null)} type="button">
            <ChevronLeft size={16} />
            Learning paths
          </button>
          <section className="hero-card" style={{ borderColor: `${style.color}55`, background: `linear-gradient(135deg, ${style.tint}, rgba(16,18,22,0.96))` }}>
            <div className="space-between">
              <div>
                <div className="section-kicker" style={{ color: style.color }}>
                  Investing style
                </div>
                <div className="display" style={{ color: style.color, fontSize: 54 }}>
                  {style.label} Investing
                </div>
                <p style={{ maxWidth: 640, lineHeight: 1.65, margin: "8px 0 0" }}>
                  {style.desc} The core question: {style.question}
                </p>
                <p className="muted" style={{ margin: "8px 0 0" }}>
                  Real-world model: {style.who}
                </p>
              </div>
              <div style={{ color: style.color }}>
                <StyleIcon size={58} style={style} />
              </div>
            </div>
          </section>
          <div className="grid-2">
            {concepts.map((concept) => (
              <article className="card" key={concept.term}>
                <h3 style={{ color: style.color, margin: "0 0 8px", fontSize: 16 }}>{concept.term}</h3>
                <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                  {concept.short}
                </p>
                <div className="panel-block" style={{ borderColor: `${style.color}30`, marginTop: 12, padding: 11 }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{concept.simple}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="grid-2">
            <button
              className="primary-button"
              onClick={() => {
                setTab("market");
                setLearnStyle(null);
                markStudied(style.id);
              }}
              style={{ minHeight: 50 }}
              type="button"
            >
              Try it in the Market
              <ArrowRight size={17} />
            </button>
            <button className="plain-button" onClick={() => sendBill(`Quiz me on ${style.label} Investing concepts`)} style={{ minHeight: 50 }} type="button">
              <Bot size={17} />
              Quiz me on this
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fade-in stack">
        <SectionHeader title="Learning Paths" subtitle="Level up your investing lenses, then use them in the Market." />
        <div className="grid-2">
          {STYLES.map((style) => {
            const unlocked = netWorth >= style.unlockedAt || style.id === "value" || style.id === "growth";
            return (
              <button
                className="style-card"
                disabled={!unlocked}
                key={style.id}
                onClick={() => {
                  setLearnStyle(style.id);
                  markStudied(style.id);
                }}
                style={{ borderColor: `${style.color}38`, background: `linear-gradient(135deg, ${style.tint}, rgba(16,18,22,0.94))` }}
                type="button"
              >
                {!unlocked ? (
                  <div className="owned-pill" style={{ borderColor: "var(--line)", color: "var(--muted)", background: "var(--panel-2)" }}>
                    <Lock size={11} /> Locked
                  </div>
                ) : null}
                <div className="row">
                  <div className="path-icon" style={{ color: style.color }}>
                    <StyleIcon style={style} />
                  </div>
                  <div>
                    <div className="display" style={{ color: style.color, fontSize: 26 }}>
                      {style.label}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {style.who}'s lens
                    </div>
                  </div>
                </div>
                <p className="muted" style={{ lineHeight: 1.5 }}>{style.desc}</p>
                <div className="filter-row" style={{ margin: 0 }}>
                  {style.metrics.slice(0, 3).map((metric) => (
                    <span className="filter-chip active" key={metric} style={{ borderColor: `${style.color}45`, color: style.color, background: `${style.color}14` }}>
                      {metric}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <section className="card" style={{ borderColor: "rgba(39,199,123,0.32)" }}>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div className="bill-avatar">
              <Bot size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="section-kicker" style={{ color: "var(--green)" }}>
                BILL's side quest
              </div>
              <p style={{ margin: "5px 0 0", fontWeight: 800 }}>{activeSideQuest?.prompt ?? "Daily side quest limit reached. Come back tomorrow for more."}</p>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                {todaysSideQuests.length}/{SIDE_QUEST_DAILY_LIMIT} completed today
                {activeSideQuest ? ` · Reward: +${fmt(activeSideQuest.reward)} cash` : ""}
              </p>
            </div>
            <button
              className={sideQuestLimitReached ? "plain-button" : "success-button"}
              disabled={sideQuestLimitReached}
              onClick={() => {
                setSideQuestOpen((open) => !open);
                setSideQuestError("");
              }}
              type="button"
            >
              {sideQuestLimitReached ? "Done today" : sideQuestOpen ? "Hide" : "Answer"}
              {sideQuestOpen ? <ChevronLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
          {sideQuestOpen && activeSideQuest ? (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                void submitSideQuest();
              }}
              style={{ marginTop: 18 }}
            >
              <label className="form-label">
                Ticker you found
                <input
                  className="input"
                  onChange={(event) => {
                    setSideQuestError("");
                    setSideQuestStock(event.target.value.toUpperCase());
                  }}
                  placeholder="Find it in the Market, then enter the ticker"
                  value={sideQuestStock}
                />
              </label>
              <label className="form-label">
                Explain your thinking
                <textarea
                  className="input"
                  onChange={(event) => {
                    setSideQuestError("");
                    setSideQuestAnswer(event.target.value);
                  }}
                  placeholder={activeSideQuest.placeholder}
                  rows={4}
                  style={{ minHeight: 116, resize: "vertical" }}
                  value={sideQuestAnswer}
                />
              </label>
              {sideQuestError ? <div className="form-error">{sideQuestError}</div> : null}
              <button className="primary-button" disabled={sideQuestLoading || !sideQuestStock.trim()} type="submit">
                {sideQuestLoading ? "BILL is checking..." : "Submit answer"}
                <Send size={16} />
              </button>
            </form>
          ) : null}
        </section>
      </div>
    );
  }

  function renderPortfolio() {
    return (
      <div className="fade-in stack">
        <SectionHeader title="Portfolio" subtitle="Your stocks, cash, gains, and risk in one clean view." />
        <div className="grid-2">
          <section className="card">
            <div className="section-kicker">Portfolio value</div>
            <div className="display" style={{ color: "var(--green)", fontSize: 44, marginTop: 6 }}>
              {fmt(stockValue)}
            </div>
            <div className={gain >= 0 ? "green" : "red"} style={{ fontWeight: 900 }}>
              {gain >= 0 ? "+" : ""}
              {fmt(gain)} score move
            </div>
            <div className="chart-frame">
              <SparklineSvg data={PORTFOLIO_HISTORY} secondary />
            </div>
          </section>
          <section className="card">
            <div className="section-kicker">Sector mix</div>
            <div className="chart-frame">
              <AllocationBars allocation={allocation} />
            </div>
            <div className="filter-row" style={{ marginTop: 0 }}>
              {allocation.map((item, index) => (
                <span className="filter-chip" key={item.name}>
                  <span style={{ background: sectorColors[index % sectorColors.length], borderRadius: 3, display: "inline-block", height: 10, width: 10 }} />
                  {item.name}
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className="table">
          <div className="table-row table-head">
            <div>Stock</div>
            <div>Shares</div>
            <div>Cost basis</div>
            <div>Current value</div>
            <div>Gain / loss</div>
          </div>
          {holdings.map((holding) => {
            const stock = findStock(holding.sym);
            if (!stock) return null;
            const value = stock.price * holding.shares;
            const cost = holding.avgCost * holding.shares;
            const rowGain = value - cost;
            return (
              <div className="table-row" key={holding.sym}>
                <div className="row">
                  <div className="ticker-badge" style={{ height: 34, width: 34 }}>
                    {stock.mascot}
                  </div>
                  <div>
                    <strong>{stock.sym}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {stock.name}
                    </div>
                  </div>
                </div>
                <strong>{holding.shares}</strong>
                <span>{fmt(cost)}</span>
                <strong>{fmt(value)}</strong>
                <span className={rowGain >= 0 ? "green" : "red"} style={{ fontWeight: 900 }}>
                  {rowGain >= 0 ? "+" : ""}
                  {fmt(rowGain)}
                </span>
              </div>
            );
          })}
        </section>

        <button className="plain-button" onClick={() => sendBill("Analyze my portfolio. What is my biggest risk and what question should I ask next?")} style={{ width: "fit-content" }} type="button">
          <Bot size={17} />
          Ask BILL to analyze my portfolio
        </button>
      </div>
    );
  }

  function renderLadder() {
    const myRank = leaderboardRows.find((entry) => leaderboardKey(entry.userName) === leaderboardKey(userName))?.rank ?? 1;
    return (
      <div className="fade-in stack" style={{ maxWidth: 940 }}>
        <SectionHeader title="Leaderboard" subtitle="Compare investors by net worth, holdings, and learning progress." />
        <section className="card leaderboard-card">
          <div className="space-between leaderboard-summary">
            <div>
              <div className="section-kicker gold">Your rank</div>
              <div className="display" style={{ color: "var(--gold-2)", fontSize: 44 }}>
                #{myRank}
              </div>
            </div>
            <div className="leaderboard-score">
              <span className="muted">Net worth</span>
              <strong>{fmt(netWorth)}</strong>
            </div>
          </div>

          <div className="leaderboard-list">
            <div className="leaderboard-row leaderboard-head">
              <span>Rank</span>
              <span>Investor</span>
              <span>Net worth</span>
              <span>Activity</span>
            </div>
            {leaderboardRows.map((entry) => {
              const isYou = leaderboardKey(entry.userName) === leaderboardKey(userName);
              return (
                <div className={clsx("leaderboard-row", isYou && "you")} key={`${entry.rank}-${entry.userName}`}>
                  <div className="rank-badge">{entry.rank}</div>
                  <div>
                    <strong>{entry.userName}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {entry.checkInStreak} day streak · {relativeTime(entry.updatedAt)}
                    </div>
                  </div>
                  <strong className="gold">{fmt(entry.netWorth)}</strong>
                  <div className="leaderboard-mini">
                    <span>{entry.holdingsCount} holdings</span>
                    <span>{entry.completedMissions} missions</span>
                    <span>{entry.quizCorrect} quiz correct</span>
                  </div>
                </div>
              );
            })}
            {!leaderboardRows.length ? (
              <div className="leaderboard-empty">
                <Trophy size={20} />
                <span>Finish onboarding with a username to appear here.</span>
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <SectionHeader title="Milestones" subtitle="Reach net worth levels and unlock harder investing concepts." />
          {MILESTONES.map((milestone, index) => {
            const reached = netWorth >= milestone.amount;
            const current = index === milestoneIndex;
            return (
              <div className="ladder-row" key={milestone.label}>
                <div className={clsx("ladder-node", reached && "reached")}>{reached ? milestone.badge : <Lock size={18} />}</div>
                <div className="card" style={{ borderColor: current ? "rgba(215,165,49,0.68)" : undefined }}>
                  <div className="space-between">
                    <div>
                      <span className="display" style={{ color: reached ? "var(--gold-2)" : "var(--text)", fontSize: 30 }}>
                        {milestone.label}
                      </span>
                      <span className="muted"> · {milestone.title}</span>
                    </div>
                    {current ? <span className="mode-pill">You are here</span> : reached ? <span className="green" style={{ fontWeight: 900 }}>Reached</span> : null}
                  </div>
                  {current ? (
                    <div style={{ marginTop: 12 }}>
                      <div className="space-between muted" style={{ fontSize: 12, marginBottom: 6 }}>
                        <span>{fmt(netWorth)}</span>
                        <span>{nextMilestone ? `Next: ${nextMilestone.label}` : "Top rung"}</span>
                      </div>
                      <div className="progress-rail">
                        <div className="progress-fill" style={{ width: `${milestoneProgress * 100}%` }} />
                      </div>
                    </div>
                  ) : null}
                  <p className="muted" style={{ margin: "10px 0 0", fontSize: 13 }}>
                    Unlocks: {milestone.unlocks}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    );
  }

  function renderWizard() {
    if (!wizard) return null;
    const stock = wizard.stock;
    const style = selectedWizardStyle;
    const metrics = style ? styleMetrics(stock, style.id) : [];
    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <section className="wizard">
          <div className="wizard-inner">
            <div className="space-between">
              <div className="row">
                <div className="ticker-badge" style={{ height: 52, width: 52 }}>
                  {stock.mascot}
                </div>
                <div>
                  <div className="display" style={{ color: "var(--gold)", fontSize: 34 }}>
                    {stock.sym} · {stock.name}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {fmt(stock.price)} · {stock.sector} · Analysis Wizard
                  </div>
                </div>
              </div>
              <button aria-label="Close wizard" className="icon-button" onClick={() => setWizard(null)} type="button">
                <X size={18} />
              </button>
            </div>

            <div className="step-strip">
              {["Lens", "Metrics", "Question", "BILL", "Trade"].map((label, index) => (
                <div className={clsx("step-marker", wizard.step === index && "active", wizard.step > index && "done")} key={label}>
                  {label}
                </div>
              ))}
            </div>

            {wizard.step === 0 ? (
              <div className="stack">
                <div>
                  <h2 className="page-title" style={{ fontSize: 28 }}>
                    Choose your investing lens
                  </h2>
                  <p className="page-subtitle">Different investors ask different first questions. Pick one and BILL will coach the analysis.</p>
                </div>
                <div className="grid-2">
                  {STYLES.map((candidate) => (
                    <button
                      className="style-card"
                      key={candidate.id}
                      onClick={() => {
                        updateWizard({ style: candidate.id, step: 1, answer: null });
                        markStudied(candidate.id);
                      }}
                      style={{ borderColor: `${candidate.color}40`, background: `linear-gradient(135deg, ${candidate.tint}, rgba(16,18,22,0.94))` }}
                      type="button"
                    >
                      <div className="row">
                        <div className="path-icon" style={{ color: candidate.color }}>
                          <StyleIcon style={candidate} />
                        </div>
                        <div>
                          <div className="display" style={{ color: candidate.color, fontSize: 24 }}>
                            {candidate.label}
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {candidate.question}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button className="plain-button" onClick={() => updateWizard({ step: 4, style: null })} style={{ width: "fit-content" }} type="button">
                  Skip analysis
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}

            {wizard.step === 1 && style ? (
              <div className="stack">
                <div className="row" style={{ color: style.color }}>
                  <StyleIcon style={style} size={24} />
                  <h2 className="page-title" style={{ color: style.color, fontSize: 28 }}>
                    {style.label} analysis
                  </h2>
                </div>
                <div className="metric-grid">
                  {metrics.map((metric) => (
                    <article className="metric" key={metric.label}>
                      <div className="section-kicker">{metric.label}</div>
                      <div className="display" style={{ color: metric.good ? "var(--gold-2)" : "var(--red)", fontSize: 30, marginTop: 5 }}>
                        {metric.value}
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                        {metric.helper}
                      </div>
                      <p className="muted" style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.45 }}>
                        {metric.note}
                      </p>
                    </article>
                  ))}
                </div>
                <button className="primary-button" onClick={() => updateWizard({ step: 2 })} style={{ minHeight: 48 }} type="button">
                  I reviewed the metrics
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}

            {wizard.step === 2 && style ? (
              <div className="stack">
                <div>
                  <h2 className="page-title" style={{ fontSize: 28 }}>
                    The big question
                  </h2>
                  <p className="page-subtitle">No grade here. The point is learning how to reason.</p>
                </div>
                <section className="card" style={{ borderColor: "rgba(215,165,49,0.36)" }}>
                  <div className="section-kicker gold">BILL asks</div>
                  <p style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.55 }}>{socraticQuestion(stock, style.id)}</p>
                  {answerOptions(style.id).map((option, index) => (
                    <button
                      className={clsx("answer-option", wizard.answer === index && "selected")}
                      key={option}
                      onClick={() => updateWizard({ answer: index })}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </section>
                <button className="primary-button" disabled={wizard.answer === null} onClick={() => updateWizard({ step: 3 })} style={{ minHeight: 48 }} type="button">
                  See BILL's take
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}

            {wizard.step === 3 && style ? (
              <div className="stack">
                <div>
                  <h2 className="page-title" style={{ color: "var(--gold)", fontSize: 28 }}>
                    BILL's take
                  </h2>
                  <p className="page-subtitle">A bull case, a bear case, and the question that matters.</p>
                </div>
                <section className="card" style={{ borderColor: "rgba(215,165,49,0.36)" }}>
                  <p style={{ fontSize: 16, lineHeight: 1.75 }}>{billTake(stock, style)}</p>
                </section>
                <div className="grid-2">
                  <div className="card" style={{ borderColor: "rgba(39,199,123,0.3)" }}>
                    <div className="section-kicker" style={{ color: "var(--green)" }}>
                      Bull case
                    </div>
                    <p className="muted" style={{ lineHeight: 1.55 }}>
                      {stock.moat} can protect profits, and strong execution can make today's price look reasonable later.
                    </p>
                  </div>
                  <div className="card" style={{ borderColor: "rgba(240,93,94,0.3)" }}>
                    <div className="section-kicker" style={{ color: "var(--red)" }}>
                      Bear case
                    </div>
                    <p className="muted" style={{ lineHeight: 1.55 }}>
                      A premium price leaves less room for disappointment if growth slows or expectations reset.
                    </p>
                  </div>
                </div>
                <button className="primary-button" onClick={() => updateWizard({ step: 4 })} style={{ minHeight: 48 }} type="button">
                  Make my decision
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}

            {wizard.step === 4 ? (
              <div className="stack">
                <div>
                  <h2 className="page-title" style={{ fontSize: 28 }}>
                    Your decision
                  </h2>
                  <p className="page-subtitle">You have done the thinking. Now choose, size it, and lock in the lesson.</p>
                </div>
                <div className="grid-3">
                  {(["buy", "sell", "skip"] as const).map((action) => (
                    <button
                      className={clsx(action === "buy" ? "success-button" : action === "sell" ? "danger-button" : "plain-button")}
                      key={action}
                      onClick={() => updateWizard({ action })}
                      style={{
                        minHeight: 50,
                        outline: wizard.action === action ? "2px solid var(--gold)" : "none",
                        color: action === "skip" ? "var(--text)" : undefined
                      }}
                      type="button"
                    >
                      {action === "buy" ? "Buy" : action === "sell" ? "Sell" : "Skip"}
                    </button>
                  ))}
                </div>
                {wizard.action === "buy" || wizard.action === "sell" ? (
                  <section className="card">
                    <div className="section-kicker">Shares</div>
                    <div className="row" style={{ marginTop: 9 }}>
                      <button className="icon-button" onClick={() => updateWizard({ shares: Math.max(1, wizard.shares - 1) })} type="button">
                        <Minus size={16} />
                      </button>
                      <input
                        className="input"
                        min={1}
                        onChange={(event) => updateWizard({ shares: Math.max(1, Number(event.target.value) || 1) })}
                        style={{ textAlign: "center" }}
                        type="number"
                        value={wizard.shares}
                      />
                      <button className="icon-button" onClick={() => updateWizard({ shares: wizard.shares + 1 })} type="button">
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-between" style={{ marginTop: 12 }}>
                      <span className="muted">Estimated total</span>
                      <strong className="display" style={{ color: "var(--gold-2)", fontSize: 28 }}>
                        {fmt(wizard.shares * stock.price)}
                      </strong>
                    </div>
                  </section>
                ) : null}
                {!wizard.confirmed ? (
                  <button className="primary-button" disabled={!wizard.action} onClick={executeTrade} style={{ minHeight: 52 }} type="button">
                    {wizard.action === "skip" ? "Back to market" : "Confirm and start micro-quiz"}
                    <ArrowRight size={16} />
                  </button>
                ) : null}
                {wizardQuizLoading ? (
                  <section className="quiz-card">
                    <div className="section-kicker gold">Building your micro-quiz</div>
                    <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
                      BILL is making fresh questions for this stock and avoiding ones you already answered.
                    </p>
                  </section>
                ) : null}
                {wizard.quiz ? (
                  <>
                    <QuizCard onAnswer={(index) => answerQuiz("wizard", index)} quiz={wizard.quiz} />
                    {wizard.quiz.complete ? (
                      <button className="success-button" onClick={() => setWizard(null)} style={{ minHeight: 48 }} type="button">
                        Finish
                        <Check size={16} />
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }
}
