import type {
  Concept,
  Holding,
  InvestmentStyle,
  InvestmentStyleId,
  Milestone,
  Quiz,
  Stock
} from "./types";

export const DEFAULT_YEAR = 2010;
export const STARTING_CASH = 1000;

export const ERAS = [
  {
    year: 2000,
    title: "Dot-com Bubble",
    desc: "The internet changes everything — then crashes.",
    difficulty: "Hard",
    tone: "red",
    recommended: false
  },
  {
    year: 2005,
    title: "Pre-Crisis Calm",
    desc: "Markets are up. But 2008 is coming.",
    difficulty: "Medium",
    tone: "gold",
    recommended: false
  },
  {
    year: 2010,
    title: "Recovery Begins",
    desc: "Apple, Amazon & Netflix are just warming up.",
    difficulty: "Easy",
    tone: "green",
    recommended: true
  },
  {
    year: 2015,
    title: "Mobile Era",
    desc: "Streaming wars, Tesla rises, Bitcoin emerges.",
    difficulty: "Medium",
    tone: "gold",
    recommended: false
  },
  {
    year: 2020,
    title: "COVID Crash",
    desc: "Markets crater then explode. Wild ride.",
    difficulty: "Hard",
    tone: "red",
    recommended: false
  }
] as const;

export const STOCKS: Stock[] = [
  {
    sym: "AAPL",
    name: "Apple",
    mascot: "A",
    sector: "Tech",
    price: 131.46,
    change: 2.14,
    pe: 28,
    growth: 8,
    yield: 0.6,
    moat: "Brand and ecosystem",
    desc: "Consumer electronics, software, and services.",
    since2010: 1563,
    beta: 1.2,
    rsi: 58,
    volumeScore: 72,
    fiftyTwoWeek: 94
  },
  {
    sym: "AMZN",
    name: "Amazon",
    mascot: "AM",
    sector: "Commerce",
    price: 103.29,
    change: 0.87,
    pe: 58,
    growth: 22,
    yield: 0,
    moat: "Scale and Prime",
    desc: "E-commerce, cloud computing, advertising, and logistics.",
    since2010: 1413,
    beta: 1.4,
    rsi: 61,
    volumeScore: 76,
    fiftyTwoWeek: 88
  },
  {
    sym: "NFLX",
    name: "Netflix",
    mascot: "N",
    sector: "Streaming",
    price: 448.32,
    change: -1.23,
    pe: 41,
    growth: 15,
    yield: 0,
    moat: "Content library",
    desc: "Streaming entertainment with a global subscriber base.",
    since2010: 3830,
    beta: 1.5,
    rsi: 47,
    volumeScore: 62,
    fiftyTwoWeek: 74
  },
  {
    sym: "TSLA",
    name: "Tesla",
    mascot: "T",
    sector: "EV",
    price: 174.83,
    change: 3.45,
    pe: 52,
    growth: 19,
    yield: 0,
    moat: "Brand and software",
    desc: "Electric vehicles, energy storage, and autonomous driving.",
    since2010: 5890,
    beta: 2.1,
    rsi: 67,
    volumeScore: 88,
    fiftyTwoWeek: 91
  },
  {
    sym: "GOOGL",
    name: "Google",
    mascot: "G",
    sector: "Tech",
    price: 140.53,
    change: 1.02,
    pe: 24,
    growth: 12,
    yield: 0,
    moat: "Search advantage",
    desc: "Search, YouTube, cloud infrastructure, ads, and AI.",
    since2010: 621,
    beta: 1.1,
    rsi: 53,
    volumeScore: 70,
    fiftyTwoWeek: 81
  },
  {
    sym: "NVDA",
    name: "Nvidia",
    mascot: "NV",
    sector: "Chips",
    price: 875.39,
    change: 5.67,
    pe: 71,
    growth: 122,
    yield: 0.03,
    moat: "CUDA ecosystem",
    desc: "AI chips, data center GPUs, gaming, and accelerated computing.",
    since2010: 168000,
    beta: 1.8,
    rsi: 73,
    volumeScore: 96,
    fiftyTwoWeek: 99
  },
  {
    sym: "CSCO",
    name: "Cisco",
    mascot: "CS",
    sector: "Networking",
    price: 118.21,
    change: 2.7,
    pe: 43,
    growth: 6,
    yield: 1.3,
    moat: "Enterprise network installed base",
    desc: "Networking hardware, cybersecurity, collaboration tools, and cloud infrastructure.",
    since2010: 420,
    beta: 0.9,
    rsi: 63,
    volumeScore: 74,
    fiftyTwoWeek: 92
  },
  {
    sym: "NKE",
    name: "Nike",
    mascot: "NK",
    sector: "Fashion",
    price: 94.12,
    change: -0.54,
    pe: 27,
    growth: 5,
    yield: 1.7,
    moat: "Brand power",
    desc: "Athletic footwear, apparel, and sports equipment.",
    since2010: 431,
    beta: 0.9,
    rsi: 42,
    volumeScore: 45,
    fiftyTwoWeek: 51
  },
  {
    sym: "DIS",
    name: "Disney",
    mascot: "D",
    sector: "Media",
    price: 88.43,
    change: -0.23,
    pe: 71,
    growth: 4,
    yield: 0,
    moat: "IP library",
    desc: "Theme parks, streaming, movies, TV, and consumer products.",
    since2010: 263,
    beta: 1.0,
    rsi: 39,
    volumeScore: 58,
    fiftyTwoWeek: 43
  },
  {
    sym: "SBUX",
    name: "Starbucks",
    mascot: "SB",
    sector: "Food",
    price: 76.24,
    change: -0.67,
    pe: 22,
    growth: 7,
    yield: 2.8,
    moat: "Loyalty program",
    desc: "Coffee shops, drive-throughs, grocery products, and rewards.",
    since2010: 812,
    beta: 0.8,
    rsi: 44,
    volumeScore: 52,
    fiftyTwoWeek: 62
  },
  {
    sym: "RBLX",
    name: "Roblox",
    mascot: "R",
    sector: "Gaming",
    price: 45.87,
    change: 1.89,
    pe: null,
    growth: 31,
    yield: 0,
    moat: "User-generated content",
    desc: "User-generated gaming platform and creator economy.",
    since2010: 0,
    beta: 1.9,
    rsi: 59,
    volumeScore: 78,
    fiftyTwoWeek: 82
  },
  {
    sym: "SPOT",
    name: "Spotify",
    mascot: "SP",
    sector: "Streaming",
    price: 272.14,
    change: 0.44,
    pe: null,
    growth: 14,
    yield: 0,
    moat: "Playlists and habits",
    desc: "Music and podcast streaming with global user scale.",
    since2010: 0,
    beta: 1.3,
    rsi: 55,
    volumeScore: 66,
    fiftyTwoWeek: 79
  },
  {
    sym: "DUOL",
    name: "Duolingo",
    mascot: "DU",
    sector: "EdTech",
    price: 244.56,
    change: 2.11,
    pe: null,
    growth: 43,
    yield: 0,
    moat: "Habit loop and brand",
    desc: "Language learning app with a playful daily habit loop.",
    since2010: 0,
    beta: 1.6,
    rsi: 64,
    volumeScore: 81,
    fiftyTwoWeek: 87
  }
];

export const MILESTONES: Milestone[] = [
  { amount: 1000, label: "$1K", title: "Saver", badge: "01", unlocks: "US stocks" },
  {
    amount: 10000,
    label: "$10K",
    title: "Hustler",
    badge: "02",
    unlocks: "Growth investing"
  },
  {
    amount: 100000,
    label: "$100K",
    title: "Hundred-Thousandaire",
    badge: "03",
    unlocks: "Index funds and ETFs"
  },
  {
    amount: 1000000,
    label: "$1M",
    title: "Millionaire",
    badge: "04",
    unlocks: "Real estate trusts"
  },
  {
    amount: 10000000,
    label: "$10M",
    title: "Multi-Millionaire",
    badge: "05",
    unlocks: "Commodities"
  },
  {
    amount: 100000000,
    label: "$100M",
    title: "Mogul",
    badge: "06",
    unlocks: "IPOs and private equity"
  },
  {
    amount: 1000000000,
    label: "$1B",
    title: "Billionaire",
    badge: "07",
    unlocks: "Hall of Fame"
  }
];

export const STYLES: InvestmentStyle[] = [
  {
    id: "value",
    icon: "Scale",
    label: "Value",
    color: "#d7a531",
    tint: "#191204",
    desc: "Buy great companies at a discount.",
    who: "Warren Buffett",
    question: "Is this company worth more than its price?",
    metrics: ["P/E Ratio", "Moat", "Margin of Safety", "Circle of Competence"],
    unlockedAt: 1000
  },
  {
    id: "growth",
    icon: "Rocket",
    label: "Growth",
    color: "#27c77b",
    tint: "#04170d",
    desc: "Back companies that can compound fast.",
    who: "Peter Lynch",
    question: "Is this company growing faster than expected?",
    metrics: ["Revenue Growth", "Market Size", "Gross Margin", "Market Share"],
    unlockedAt: 10000
  },
  {
    id: "technical",
    icon: "LineChart",
    label: "Technical",
    color: "#55c7f7",
    tint: "#03141b",
    desc: "Read the price chart like a map.",
    who: "Paul Tudor Jones",
    question: "What do price patterns tell us?",
    metrics: ["Moving Average", "RSI", "Volume", "Support"],
    unlockedAt: 50000
  },
  {
    id: "dividend",
    icon: "Banknote",
    label: "Dividend",
    color: "#a78bfa",
    tint: "#10091d",
    desc: "Get paid while you own the stock.",
    who: "John D. Rockefeller",
    question: "Does this company pay me to own it?",
    metrics: ["Dividend Yield", "Payout Ratio", "Dividend Growth", "Coverage"],
    unlockedAt: 100000
  },
  {
    id: "momentum",
    icon: "Zap",
    label: "Momentum",
    color: "#fb8a3c",
    tint: "#1b0d04",
    desc: "Ride strong trends while they last.",
    who: "Richard Driehaus",
    question: "Is this stock moving, and can I ride it?",
    metrics: ["Relative Strength", "52W High", "Trend", "Volume Surge"],
    unlockedAt: 250000
  }
];

export const CONCEPTS: Record<InvestmentStyleId, Concept[]> = {
  value: [
    {
      term: "P/E Ratio",
      short: "Price divided by earnings per share. It shows how expensive the stock is relative to profits.",
      simple: "If P/E is 20, investors pay $20 for every $1 the company earns in a year."
    },
    {
      term: "Intrinsic Value",
      short: "What the entire business is worth based on its future cash flows.",
      simple: "Like appraising a house before deciding whether the asking price is fair."
    },
    {
      term: "Margin of Safety",
      short: "Buying below your estimate of value so mistakes do not hurt as much.",
      simple: "It is the investing version of leaving room for error."
    },
    {
      term: "Economic Moat",
      short: "A durable advantage that keeps competitors from stealing customers.",
      simple: "Ask: why can't someone copy this business tomorrow?"
    },
    {
      term: "Circle of Competence",
      short: "Only investing in businesses you understand well enough to explain.",
      simple: "If you cannot explain how it makes money, keep learning before buying."
    }
  ],
  growth: [
    {
      term: "Revenue Growth",
      short: "How fast the company's sales are increasing year over year.",
      simple: "A company growing 30% yearly roughly doubles sales every 2.4 years."
    },
    {
      term: "TAM",
      short: "Total addressable market: how big the opportunity could become.",
      simple: "A tiny company in a massive market has more runway."
    },
    {
      term: "Gross Margin",
      short: "Revenue left after direct costs. Higher margins can mean a better business model.",
      simple: "Software margins usually beat restaurant margins because copies cost little."
    },
    {
      term: "Rule of 40",
      short: "Growth rate plus profit margin should be at least 40 for healthy software companies.",
      simple: "Fast growth can be okay with low profit if the combined score is strong."
    },
    {
      term: "Market Share",
      short: "How much of the industry the company owns, and whether that slice is growing.",
      simple: "Winning share means competitors are losing ground."
    }
  ],
  technical: [
    {
      term: "Support and Resistance",
      short: "Price zones where buyers or sellers often show up.",
      simple: "Support is a floor. Resistance is a ceiling."
    },
    {
      term: "Moving Averages",
      short: "Smoothed price trends over windows like 50 or 200 days.",
      simple: "They help you see the trend without every tiny wiggle."
    },
    {
      term: "RSI",
      short: "Relative strength index, a 0 to 100 score for momentum extremes.",
      simple: "Below 30 can be oversold. Above 70 can be overheated."
    },
    {
      term: "Volume",
      short: "How many shares traded. Big moves matter more when volume confirms them.",
      simple: "A crowd agreeing with the move gives it more weight."
    },
    {
      term: "Candlesticks",
      short: "A visual way to show opening, high, low, and closing prices.",
      simple: "They tell the emotional story of a trading day."
    }
  ],
  dividend: [
    {
      term: "Dividend Yield",
      short: "Annual dividend divided by stock price.",
      simple: "A 3% yield pays about $3 per year for each $100 invested."
    },
    {
      term: "Payout Ratio",
      short: "How much profit is paid out as dividends.",
      simple: "Too high can mean the payment is hard to maintain."
    },
    {
      term: "Dividend Growth",
      short: "How quickly the dividend grows over time.",
      simple: "Small raises compound into meaningful income."
    },
    {
      term: "Dividend Aristocrats",
      short: "Companies that raised dividends for at least 25 straight years.",
      simple: "Consistency is the point."
    },
    {
      term: "Reinvestment",
      short: "Using dividends to buy more shares.",
      simple: "Your shares can buy more shares for you."
    }
  ],
  momentum: [
    {
      term: "Relative Strength",
      short: "How a stock performs compared with the market or peers.",
      simple: "Momentum investors want the leaders, not the laggards."
    },
    {
      term: "52-Week High",
      short: "The highest price from the past year.",
      simple: "Breaking old highs can signal fresh demand."
    },
    {
      term: "Trend Following",
      short: "Staying with the move as long as it keeps working.",
      simple: "The trend is useful until it breaks."
    },
    {
      term: "Position Sizing",
      short: "Choosing how much to risk on a high-speed idea.",
      simple: "Fast stocks deserve careful sizing."
    },
    {
      term: "Exit Signals",
      short: "Rules for leaving when momentum fades.",
      simple: "Momentum without an exit plan can turn into hope."
    }
  ]
};

export const INITIAL_HOLDINGS: Holding[] = [];

export const MISSIONS = [
  {
    id: "analysis",
    text: "Complete one Analysis Wizard",
    reward: 2000,
    concept: "Decision-making"
  },
  {
    id: "concepts",
    text: "Learn three investing concepts",
    reward: 1500,
    concept: "Vocabulary"
  },
  {
    id: "diversify",
    text: "Diversify into two sectors",
    reward: 3000,
    concept: "Risk control"
  }
];

export const PORTFOLIO_HISTORY = [
  { year: "2010", value: 10000, sp: 10000 },
  { year: "2011", value: 12840, sp: 10920 },
  { year: "2012", value: 16420, sp: 12670 },
  { year: "2013", value: 24100, sp: 16780 },
  { year: "2014", value: 28320, sp: 19040 },
  { year: "2015", value: 31840, sp: 19470 },
  { year: "2016", value: 36560, sp: 21730 },
  { year: "2017", value: 47382, sp: 29200 }
];

export const QUIZ_CORRECT_REWARD = 25;

export const QUIZ_POOL: Record<InvestmentStyleId, Quiz> = {
  value: {
    topic: "Value Investing",
    questions: [
      {
        q: "Apple has a P/E of 28 while the tech average is 24. What does that suggest?",
        opts: [
          "Apple is cheaper than peers",
          "Apple is more expensive than peers",
          "Apple is exactly average",
          "P/E does not apply"
        ],
        a: 1,
        exp: "A higher P/E means investors pay more per dollar of earnings."
      },
      {
        q: "What does margin of safety mean?",
        opts: [
          "Only buy famous brands",
          "Buy below your estimate of value",
          "Never sell a stock",
          "Avoid every risky sector"
        ],
        a: 1,
        exp: "Margin of safety is the cushion between price and estimated value."
      }
    ]
  },
  growth: {
    topic: "Growth Investing",
    questions: [
      {
        q: "A company growing revenue 31% per year roughly doubles sales every:",
        opts: ["1 year", "2.4 years", "5 years", "10 years"],
        a: 1,
        exp: "The Rule of 72 says 72 divided by 31 is about 2.3 years."
      },
      {
        q: "Which business is most likely to have very high gross margins?",
        opts: ["Grocery store", "Steel mill", "Software app", "Pizza shop"],
        a: 2,
        exp: "Software can be copied and delivered cheaply, so gross margins can be high."
      }
    ]
  },
  technical: {
    topic: "Technical Analysis",
    questions: [
      {
        q: "An RSI above 70 often means a stock is:",
        opts: ["Oversold", "Overbought", "Bankrupt", "Paying dividends"],
        a: 1,
        exp: "Above 70 can suggest the price has moved too far too quickly."
      },
      {
        q: "Why does volume matter?",
        opts: [
          "It shows the stock's dividend",
          "It confirms how many traders support the move",
          "It replaces earnings",
          "It sets the stock price"
        ],
        a: 1,
        exp: "A move with high volume has more participation behind it."
      }
    ]
  },
  dividend: {
    topic: "Dividend Investing",
    questions: [
      {
        q: "Dividend yield tells you:",
        opts: [
          "How much a company pays relative to its price",
          "How fast revenue grows",
          "Whether the chart broke out",
          "The CEO's salary"
        ],
        a: 0,
        exp: "Yield is annual dividend divided by stock price."
      },
      {
        q: "A payout ratio that is too high can be risky because:",
        opts: [
          "The company may not afford future payments",
          "The stock cannot grow",
          "Dividends are illegal",
          "It means no one buys the stock"
        ],
        a: 0,
        exp: "If too much profit is paid out, there may be little room for trouble."
      }
    ]
  },
  momentum: {
    topic: "Momentum Investing",
    questions: [
      {
        q: "Momentum investors usually look for stocks that are:",
        opts: ["Falling slowly", "Flat for years", "Outperforming peers", "Always cheapest"],
        a: 2,
        exp: "Momentum starts with relative strength."
      },
      {
        q: "Why do momentum investors need exit signals?",
        opts: [
          "To know when the trend weakens",
          "To avoid reading charts",
          "To collect dividends",
          "To calculate P/E"
        ],
        a: 0,
        exp: "Momentum can reverse quickly, so exits matter."
      }
    ]
  }
};

export function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function fmtCompact(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
}

export function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function getStock(sym: string) {
  return STOCKS.find((stock) => stock.sym === sym);
}

export function getMilestoneIndex(netWorth: number) {
  let idx = 0;
  for (let i = 1; i < MILESTONES.length; i += 1) {
    if (netWorth >= MILESTONES[i].amount) idx = i;
  }
  return idx;
}

export function getMilestoneProgress(netWorth: number) {
  const idx = getMilestoneIndex(netWorth);
  const current = MILESTONES[idx].amount;
  const next = MILESTONES[idx + 1]?.amount;
  if (!next) return 1;
  return Math.min(1, Math.max(0, (netWorth - current) / (next - current)));
}

export function portfolioValue(holdings: Holding[]) {
  return holdings.reduce((sum, holding) => {
    const stock = getStock(holding.sym);
    return sum + (stock?.price ?? 0) * holding.shares;
  }, 0);
}

export function portfolioCost(holdings: Holding[]) {
  return holdings.reduce((sum, holding) => sum + holding.avgCost * holding.shares, 0);
}
