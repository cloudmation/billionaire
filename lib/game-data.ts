import type {
  Concept,
  GameProgressPayload,
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
    price: 300.23,
    change: 2.36,
    pe: 28,
    growth: 8,
    yield: 0.6,
    moat: "Brand and ecosystem",
    desc: "Consumer electronics, software, and services.",
    since2010: 4584,
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
    price: 264.14,
    change: -3.13,
    pe: 58,
    growth: 22,
    yield: 0,
    moat: "Scale and Prime",
    desc: "E-commerce, cloud computing, advertising, and logistics.",
    since2010: 3843,
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
    price: 87.02,
    change: -0.54,
    pe: 41,
    growth: 15,
    yield: 0,
    moat: "Content library",
    desc: "Streaming entertainment with a global subscriber base.",
    since2010: 11350,
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
    price: 422.24,
    change: -1.43,
    pe: 52,
    growth: 19,
    yield: 0,
    moat: "Brand and software",
    desc: "Electric vehicles, energy storage, and autonomous driving.",
    since2010: 26454,
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
    price: 396.78,
    change: -1,
    pe: 24,
    growth: 12,
    yield: 0,
    moat: "Search advantage",
    desc: "Search, YouTube, cloud infrastructure, ads, and AI.",
    since2010: 2450,
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
    price: 225.32,
    change: 4.7,
    pe: 71,
    growth: 122,
    yield: 0.03,
    moat: "CUDA ecosystem",
    desc: "AI chips, data center GPUs, gaming, and accelerated computing.",
    since2010: 53552,
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
    change: 22.41,
    pe: 43,
    growth: 6,
    yield: 1.3,
    moat: "Enterprise network installed base",
    desc: "Networking hardware, cybersecurity, collaboration tools, and cloud infrastructure.",
    since2010: 644,
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
    price: 41.88,
    change: -5.12,
    pe: 27,
    growth: 5,
    yield: 1.7,
    moat: "Brand power",
    desc: "Athletic footwear, apparel, and sports equipment.",
    since2010: 218,
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
    price: 102.72,
    change: -4.91,
    pe: 71,
    growth: 4,
    yield: 0,
    moat: "IP library",
    desc: "Theme parks, streaming, movies, TV, and consumer products.",
    since2010: 276,
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
    price: 106.82,
    change: 1.8,
    pe: 22,
    growth: 7,
    yield: 2.8,
    moat: "Loyalty program",
    desc: "Coffee shops, drive-throughs, grocery products, and rewards.",
    since2010: 1150,
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
    price: 42.85,
    change: 2.24,
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
    price: 436.94,
    change: 4.57,
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
    price: 112.06,
    change: 3.77,
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

export const MAX_MARKET_YEAR = 2026;

export const HISTORICAL_PRICES: Record<string, Partial<Record<number, number>>> = {
  AAPL: {
    2000: 0.84,
    2001: 0.22,
    2002: 0.35,
    2003: 0.22,
    2004: 0.32,
    2005: 0.95,
    2006: 2.24,
    2007: 2.51,
    2008: 5.83,
    2009: 2.72,
    2010: 6.41,
    2011: 9.87,
    2012: 12.31,
    2013: 16.58,
    2014: 17.12,
    2015: 24.19,
    2016: 23.71,
    2017: 26.72,
    2018: 40.27,
    2019: 37.47,
    2020: 72.33,
    2021: 125.74,
    2022: 177.94,
    2023: 122.98,
    2024: 183.56,
    2025: 242.3,
    2026: 270.51
  },
  AMZN: {
    2000: 4.47,
    2001: 0.69,
    2002: 0.55,
    2003: 0.98,
    2004: 2.6,
    2005: 2.23,
    2006: 2.38,
    2007: 1.93,
    2008: 4.81,
    2009: 2.72,
    2010: 6.7,
    2011: 9.21,
    2012: 8.95,
    2013: 12.87,
    2014: 19.9,
    2015: 15.43,
    2016: 31.85,
    2017: 37.68,
    2018: 59.45,
    2019: 76.96,
    2020: 94.9,
    2021: 159.33,
    2022: 170.4,
    2023: 85.82,
    2024: 149.93,
    2025: 220.22,
    2026: 226.5
  },
  NFLX: {
    2002: 0.12,
    2003: 0.08,
    2004: 0.39,
    2005: 0.17,
    2006: 0.37,
    2007: 0.38,
    2008: 0.38,
    2009: 0.43,
    2010: 0.76,
    2011: 2.55,
    2012: 1.03,
    2013: 1.31,
    2014: 5.18,
    2015: 4.98,
    2016: 11,
    2017: 12.75,
    2018: 20.11,
    2019: 26.77,
    2020: 32.98,
    2021: 52.29,
    2022: 59.74,
    2023: 29.5,
    2024: 46.85,
    2025: 88.67,
    2026: 90.99
  },
  TSLA: {
    2010: 1.59,
    2011: 1.77,
    2012: 1.87,
    2013: 2.36,
    2014: 10.01,
    2015: 14.62,
    2016: 14.89,
    2017: 14.47,
    2018: 21.37,
    2019: 20.67,
    2020: 28.68,
    2021: 243.26,
    2022: 399.93,
    2023: 108.1,
    2024: 248.42,
    2025: 379.28,
    2026: 438.07
  },
  GOOGL: {
    2004: 2.49,
    2005: 5.03,
    2006: 10.8,
    2007: 11.61,
    2008: 17.01,
    2009: 7.98,
    2010: 15.56,
    2011: 15,
    2012: 16.52,
    2013: 17.95,
    2014: 27.63,
    2015: 26.26,
    2016: 37.66,
    2017: 40.07,
    2018: 53.22,
    2019: 52.3,
    2020: 67.87,
    2021: 85.6,
    2022: 143.8,
    2023: 88.39,
    2024: 137.04,
    2025: 188.56,
    2026: 314.93
  },
  NVDA: {
    2000: 0.09,
    2001: 0.11,
    2002: 0.51,
    2003: 0.09,
    2004: 0.18,
    2005: 0.18,
    2006: 0.29,
    2007: 0.55,
    2008: 0.76,
    2009: 0.2,
    2010: 0.42,
    2011: 0.36,
    2012: 0.32,
    2013: 0.29,
    2014: 0.37,
    2015: 0.48,
    2016: 0.79,
    2017: 2.51,
    2018: 4.93,
    2019: 3.38,
    2020: 5.97,
    2021: 13.08,
    2022: 30.06,
    2023: 14.3,
    2024: 48.14,
    2025: 138.26,
    2026: 188.84
  },
  CSCO: {
    2000: 34.77,
    2001: 21.44,
    2002: 12.38,
    2003: 8.78,
    2004: 15.61,
    2005: 12.43,
    2006: 11.23,
    2007: 17.85,
    2008: 17.08,
    2009: 10.91,
    2010: 15.89,
    2011: 13.19,
    2012: 12.17,
    2013: 13.59,
    2014: 15.15,
    2015: 19.6,
    2016: 19.34,
    2017: 22.97,
    2018: 30.27,
    2019: 34.47,
    2020: 40.25,
    2021: 37.83,
    2022: 55.5,
    2023: 43.45,
    2024: 47.18,
    2025: 57,
    2026: 75.63
  },
  NKE: {
    2000: 4.44,
    2001: 5.03,
    2002: 5.32,
    2003: 4.33,
    2004: 6.38,
    2005: 8.61,
    2006: 8.21,
    2007: 9.4,
    2008: 12.33,
    2009: 10.5,
    2010: 13.18,
    2011: 17.62,
    2012: 20.11,
    2013: 21.85,
    2014: 33.44,
    2015: 41.11,
    2016: 53.79,
    2017: 45.99,
    2018: 56.93,
    2019: 67.15,
    2020: 93.65,
    2021: 129.61,
    2022: 153.48,
    2023: 111.87,
    2024: 101.67,
    2025: 71.5,
    2026: 62.86
  },
  DIS: {
    2000: 22.58,
    2001: 21.26,
    2002: 16.5,
    2003: 13.44,
    2004: 18.61,
    2005: 22.09,
    2006: 19.56,
    2007: 27.67,
    2008: 26.39,
    2009: 20.12,
    2010: 27.29,
    2011: 32.54,
    2012: 33.51,
    2013: 45.39,
    2014: 68.58,
    2015: 85.37,
    2016: 94.92,
    2017: 99.25,
    2018: 106.22,
    2019: 105.18,
    2020: 144.79,
    2021: 173.59,
    2022: 153.15,
    2023: 86.92,
    2024: 88.91,
    2025: 109.61,
    2026: 111.85
  },
  SBUX: {
    2000: 2.29,
    2001: 3.9,
    2002: 3.62,
    2003: 3.93,
    2004: 6.11,
    2005: 11.34,
    2006: 11.45,
    2007: 13.08,
    2008: 7.16,
    2009: 3.65,
    2010: 8.55,
    2011: 12.51,
    2012: 17.29,
    2013: 21.31,
    2014: 30.29,
    2015: 32.45,
    2016: 47.03,
    2017: 45.35,
    2018: 48.09,
    2019: 54.92,
    2020: 77.72,
    2021: 91.53,
    2022: 105.3,
    2023: 93.16,
    2024: 88.36,
    2025: 89.21,
    2026: 83.43
  },
  RBLX: {
    2021: 69.5,
    2022: 98.81,
    2023: 27.85,
    2024: 42.99,
    2025: 58.84,
    2026: 80.95
  },
  SPOT: {
    2018: 149.01,
    2019: 113.74,
    2020: 151.62,
    2021: 311,
    2022: 244.16,
    2023: 81.9,
    2024: 188.8,
    2025: 457.79,
    2026: 575
  },
  DUOL: {
    2021: 134.26,
    2022: 105.07,
    2023: 70.93,
    2024: 214.35,
    2025: 325.88,
    2026: 176.48
  }
};

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

function localMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function yearPrice(sym: string, year: number) {
  return HISTORICAL_PRICES[sym]?.[year];
}

function firstHistoryYear(sym: string) {
  const years = Object.keys(HISTORICAL_PRICES[sym] ?? {})
    .map(Number)
    .sort((a, b) => a - b);
  return years[0] ?? MAX_MARKET_YEAR;
}

function previousHistoryPrice(sym: string, year: number) {
  const years = Object.keys(HISTORICAL_PRICES[sym] ?? {})
    .map(Number)
    .filter((candidate) => candidate < year)
    .sort((a, b) => b - a);
  const previousYear = years[0];
  return previousYear ? yearPrice(sym, previousYear) : undefined;
}

export function getSimulatedYear(startYear: number, journeyStartedAt?: string | null, now = new Date()) {
  if (!journeyStartedAt) return Math.min(MAX_MARKET_YEAR, startYear);
  const started = new Date(journeyStartedAt);
  if (Number.isNaN(started.getTime())) return Math.min(MAX_MARKET_YEAR, startYear);
  const elapsedDays = Math.max(0, Math.floor((localMidnight(now) - localMidnight(started)) / 86_400_000));
  return Math.min(MAX_MARKET_YEAR, Math.max(startYear, startYear + elapsedDays));
}

export function getMarketYear(progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt">, now = new Date()) {
  return progress.gameMode === "live" ? MAX_MARKET_YEAR : getSimulatedYear(progress.startYear, progress.journeyStartedAt, now);
}

export function getMarketStocks(
  progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt" | "customStocks">,
  now = new Date()
) {
  const marketYear = getMarketYear(progress, now);
  const stocks = new Map<string, Stock>();

  STOCKS.forEach((stock) => {
    if (progress.gameMode === "live") {
      stocks.set(stock.sym, stock);
      return;
    }

    const price = yearPrice(stock.sym, marketYear);
    if (price == null) return;

    const previous = previousHistoryPrice(stock.sym, marketYear);
    const firstYear = firstHistoryYear(stock.sym);
    const baseYear = Math.max(progress.startYear, firstYear);
    const basePrice = yearPrice(stock.sym, baseYear) ?? price;
    const change = previous != null ? ((price - previous) / previous) * 100 : 0;
    const sinceStart = basePrice ? ((price - basePrice) / basePrice) * 100 : 0;

    stocks.set(stock.sym, {
      ...stock,
      price: roundMoney(price),
      change: Math.round(change * 100) / 100,
      since2010: Math.round(sinceStart)
    });
  });

  (progress.customStocks ?? []).forEach((stock) => {
    stocks.set(stock.sym, stock);
  });

  return Array.from(stocks.values());
}

export function portfolioValueAtMarket(progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt" | "customStocks" | "holdings">) {
  const stocks = new Map<string, Stock>();
  getMarketStocks(progress).forEach((stock) => stocks.set(stock.sym, stock));
  return (progress.holdings ?? []).reduce((sum, holding) => {
    const stock = stocks.get(holding.sym);
    return sum + (stock?.price ?? 0) * holding.shares;
  }, 0);
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
