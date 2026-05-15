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
  Home,
  LineChart,
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
  X,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONCEPTS,
  fmt,
  fmtCompact,
  getMilestoneIndex,
  getMilestoneProgress,
  getStock,
  MILESTONES,
  MISSIONS,
  pct,
  PORTFOLIO_HISTORY,
  portfolioCost,
  portfolioValue,
  QUIZ_POOL,
  STOCKS,
  STYLES,
  YEAR_SIM
} from "@/lib/game-data";
import { useGameStore } from "@/lib/store";
import type {
  BillMessage,
  GameProgressPayload,
  InvestmentStyle,
  InvestmentStyleId,
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
  complete?: boolean;
};

const navItems: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "market", label: "Market", icon: BarChart3 },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "ladder", label: "Ladder", icon: Trophy }
];

const sectorColors = ["#d7a531", "#27c77b", "#55c7f7", "#a78bfa", "#fb8a3c", "#f05d5e"];

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

function extractQuiz(raw: string): { text: string; quiz: ActiveQuiz | null } {
  const match = raw.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
  if (!match) return { text: raw, quiz: null };
  try {
    const parsed = JSON.parse(match[1]) as Quiz;
    return {
      text: raw.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/, "").trim(),
      quiz: { ...parsed, current: 0, answers: [] }
    };
  } catch {
    return { text: raw.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/, "").trim(), quiz: null };
  }
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
  if (!question) {
    return (
      <div className="quiz-card">
        <div className="section-kicker gold">Quiz complete</div>
        <p className="muted" style={{ margin: "8px 0 0", fontSize: compact ? 12 : 14 }}>
          Nice work. BILL saved this to your learning history.
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
        <p className="muted" style={{ margin: "9px 0 0", fontSize: 12, lineHeight: 1.45 }}>
          {question.exp}
        </p>
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

function HoldingsBars({ holdings }: { holdings: GameProgressPayload["holdings"] }) {
  const items = holdings
    .map((holding) => {
      const stock = getStock(holding.sym);
      return {
        sym: holding.sym,
        value: (stock?.price ?? 0) * holding.shares
      };
    })
    .filter((item) => item.value > 0);
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
  const cash = useGameStore((state) => state.cash);
  const holdings = useGameStore((state) => state.holdings);
  const completedMissions = useGameStore((state) => state.completedMissions);
  const studiedStyles = useGameStore((state) => state.studiedStyles);
  const trades = useGameStore((state) => state.trades);
  const quizHistory = useGameStore((state) => state.quizHistory);
  const loadProgress = useGameStore((state) => state.loadProgress);
  const buyStock = useGameStore((state) => state.buyStock);
  const sellStock = useGameStore((state) => state.sellStock);
  const markStudied = useGameStore((state) => state.markStudied);
  const recordQuiz = useGameStore((state) => state.recordQuiz);
  const snapshot = useGameStore((state) => state.snapshot);

  const [tab, setTab] = useState<TabId>("home");
  const [sector, setSector] = useState("All");
  const [search, setSearch] = useState("");
  const [learnStyle, setLearnStyle] = useState<InvestmentStyleId | null>(null);
  const [wizard, setWizard] = useState<WizardState | null>(null);
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
  const [displayNetWorth, setDisplayNetWorth] = useState(0);
  const loadedServer = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const stockValue = useMemo(() => portfolioValue(holdings), [holdings]);
  const costBasis = useMemo(() => portfolioCost(holdings), [holdings]);
  const netWorth = cash + stockValue;
  const gain = stockValue - costBasis;
  const milestoneIndex = getMilestoneIndex(netWorth);
  const milestoneProgress = getMilestoneProgress(netWorth);
  const currentMilestone = MILESTONES[milestoneIndex];
  const nextMilestone = MILESTONES[milestoneIndex + 1];
  const selectedWizardStyle = wizard?.style ? STYLES.find((style) => style.id === wizard.style) ?? null : null;

  useEffect(() => {
    const panel = chatScrollRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages, billLoading, billQuiz]);

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
    if (!hydrated || loadedServer.current) return;
    loadedServer.current = true;
    fetch("/api/progress")
      .then((response) => response.json())
      .then((data: { progress?: GameProgressPayload | null }) => {
        if (data.progress) loadProgress(data.progress);
      })
      .catch(() => undefined);
  }, [hydrated, loadProgress]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: progressPayload(snapshot) })
      }).catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [cash, holdings, completedMissions, studiedStyles, trades, quizHistory, hydrated, snapshot]);

  const sectors = useMemo(() => ["All", ...Array.from(new Set(STOCKS.map((stock) => stock.sector)))], []);
  const filteredStocks = useMemo(
    () =>
      STOCKS.filter((stock) => {
        const sectorMatch = sector === "All" || stock.sector === sector;
        const textMatch =
          !search.trim() ||
          `${stock.sym} ${stock.name} ${stock.sector}`.toLowerCase().includes(search.trim().toLowerCase());
        return sectorMatch && textMatch;
      }),
    [sector, search]
  );

  const allocation = useMemo(() => {
    const bySector = new Map<string, number>();
    holdings.forEach((holding) => {
      const stock = getStock(holding.sym);
      if (!stock) return;
      bySector.set(stock.sector, (bySector.get(stock.sector) ?? 0) + stock.price * holding.shares);
    });
    return Array.from(bySector.entries()).map(([name, value]) => ({ name, value }));
  }, [holdings]);

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
    const nextAnswers = [...currentQuiz.answers];
    nextAnswers[currentQuiz.current] = index;
    const nextQuiz = { ...currentQuiz, answers: nextAnswers };
    setter(nextQuiz);
    window.setTimeout(() => {
      const nextIndex = nextQuiz.current + 1;
      if (nextIndex >= nextQuiz.questions.length) {
        const correct = nextQuiz.questions.reduce((sum, question, questionIndex) => {
          return sum + (nextAnswers[questionIndex] === question.a ? 1 : 0);
        }, 0);
        recordQuiz({ topic: nextQuiz.topic, correct, total: nextQuiz.questions.length });
        setter({ ...nextQuiz, current: nextIndex, complete: true });
      } else {
        setter({ ...nextQuiz, current: nextIndex });
      }
    }, index === currentQuiz.questions[currentQuiz.current].a ? 900 : 1600);
  }

  async function sendBill(quick?: string) {
    const content = (quick ?? billInput).trim();
    if (!content || billLoading) return;
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
      quiz: { ...QUIZ_POOL[wizard.style ?? "value"], current: 0, answers: [] }
    });
  }

  const quickActions = [
    tab === "market" ? "Explain the P/E ratio using the stock list" : null,
    tab === "learn" ? "Quiz me on value investing" : null,
    tab === "portfolio" ? "What is my biggest portfolio risk?" : null,
    tab === "home" ? "What should I focus on today?" : null,
    "Give me a stock challenge"
  ].filter(Boolean) as string[];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <div className="brand-name">BILLIONAIRE</div>
            <div className="brand-sub">Investing game</div>
          </div>
        </div>
        <div className="milestone-strip">
          <div className="mode-pill">
            <Sparkles size={14} />
            Time Machine · {YEAR_SIM}
          </div>
          <div className="progress-rail" aria-label="Milestone progress">
            <div className="progress-fill" style={{ width: `${milestoneProgress * 100}%` }} />
          </div>
          <div className="tiny-pill">{nextMilestone ? nextMilestone.label : "Top"}</div>
        </div>
        <div className="stat-stack">
          <div className="stat-label">Net worth</div>
          <div className="stat-value">{fmt(displayNetWorth || netWorth)}</div>
        </div>
        <div className="tiny-pill">
          <Zap size={14} />
          12 day streak
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
            <div className="section-kicker">Today's progress</div>
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
            <div className="section-kicker">Learning path</div>
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
            <div className="section-kicker">Trades remaining</div>
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

        <aside className="bill-panel">
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
                <div className={clsx("message", message.role)}>{message.content}</div>
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
      </div>

      {wizard ? renderWizard() : null}
    </div>
  );

  function renderHome() {
    const statCards = [
      { label: "Cash available", value: fmt(cash), color: "var(--text)" },
      { label: "In stocks", value: fmt(stockValue), color: "var(--cyan)" },
      { label: "Total gain", value: `${gain >= 0 ? "+" : ""}${fmt(gain)}`, color: gain >= 0 ? "var(--green)" : "var(--red)" },
      {
        label: "Next milestone",
        value: nextMilestone ? `${fmtCompact(nextMilestone.amount - netWorth)} away` : "Complete",
        color: "var(--gold-2)"
      }
    ];
    return (
      <div className="fade-in stack">
        <div className="hero-grid">
          <section className="hero-card">
            <div>
              <div className="section-kicker gold">Your net worth · {YEAR_SIM}</div>
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
            <div className="section-kicker gold">It's now {YEAR_SIM}</div>
            <h2 className="display" style={{ fontSize: 44, margin: "8px 0 4px", color: "rgba(240,199,109,0.9)" }}>
              2017
            </h2>
            <p style={{ margin: 0, lineHeight: 1.65 }}>
              iPhone X launches, streaming becomes mainstream, and chip stocks are quietly setting up for a massive decade.
            </p>
            <div className="panel-block" style={{ marginTop: 15, padding: 12 }}>
              <div className="section-kicker">BILL's note</div>
              <p className="muted" style={{ margin: "7px 0 0", lineHeight: 1.55, fontSize: 13 }}>
                Your Nvidia position is already a monster winner. The question is whether you understand the business well enough to hold through volatility.
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

        <div className="grid-2">
          <section className="card">
            <div className="space-between">
              <div className="section-kicker">Daily missions</div>
              <Target size={18} color="var(--green)" />
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
            <div className="section-kicker">Portfolio snapshot</div>
            <div className="chart-frame" style={{ height: 210 }}>
              <HoldingsBars holdings={holdings} />
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
          <SectionHeader title={`Stock Market · ${YEAR_SIM}`} subtitle="Click any company to run the Analysis Wizard before trading." />
          <div className="mode-pill">
            <Target size={14} />
            3 trades/day
          </div>
        </div>

        <div className="filter-row">
          <div style={{ position: "relative", minWidth: 230 }}>
            <Search size={16} style={{ left: 11, position: "absolute", top: 11, color: "var(--muted-2)" }} />
            <input
              className="input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search stocks"
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
            return (
              <button className="stock-card" key={stock.sym} onClick={() => openWizard(stock)} type="button">
                {owned ? <div className="owned-pill">Owned</div> : null}
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
                {stock.since2010 ? (
                  <div className="gold" style={{ marginTop: 10, fontSize: 12, fontWeight: 900 }}>
                    Since 2010: +{stock.since2010.toLocaleString()}%
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
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
            Academy
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
              Practice with a real stock
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
        <SectionHeader title="Investing Academy" subtitle="Master each style to unlock better questions and sharper analysis." />
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
          <div className="row">
            <div className="bill-avatar">
              <Bot size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="section-kicker" style={{ color: "var(--green)" }}>
                BILL's daily challenge
              </div>
              <p style={{ margin: "5px 0 0", fontWeight: 800 }}>
                Find a value stock with a P/E under 25 and explain whether the moat is strong enough.
              </p>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                Reward: +$5,000 demo bonus and better value-analysis progress.
              </p>
            </div>
            <button className="success-button" onClick={() => setTab("market")} type="button">
              Start
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    );
  }

  function renderPortfolio() {
    return (
      <div className="fade-in stack">
        <SectionHeader title="Portfolio" subtitle="A clear look at your holdings, gains, and concentration risk." />
        <div className="grid-2">
          <section className="card">
            <div className="section-kicker">Portfolio value</div>
            <div className="display" style={{ color: "var(--green)", fontSize: 44, marginTop: 6 }}>
              {fmt(stockValue)}
            </div>
            <div className={gain >= 0 ? "green" : "red"} style={{ fontWeight: 900 }}>
              {gain >= 0 ? "+" : ""}
              {fmt(gain)} total gain
            </div>
            <div className="chart-frame">
              <SparklineSvg data={PORTFOLIO_HISTORY} secondary />
            </div>
          </section>
          <section className="card">
            <div className="section-kicker">Sector allocation</div>
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
            const stock = getStock(holding.sym);
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
    return (
      <div className="fade-in" style={{ maxWidth: 760 }}>
        <SectionHeader title="The Billion Dollar Ladder" subtitle="Wealth milestones unlock new styles, tools, and harder questions." />
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
