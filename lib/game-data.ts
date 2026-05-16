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
import dailyPrices from "./historical-daily-prices.json";

export const DEFAULT_YEAR = 2010;
export const STARTING_CASH = 1000;
export const TRADES_PER_DAY = 3;

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
    sym: "BRK-B",
    name: "Berkshire Hathaway",
    mascot: "BH",
    sector: "Conglomerate",
    price: 482.7,
    change: -0.28,
    pe: 10,
    growth: 6,
    yield: 0,
    moat: "Insurance float and capital discipline",
    desc: "A collection of insurance, railroads, energy, and consumer businesses run with long-term capital discipline.",
    since2010: 629,
    beta: 0.8,
    rsi: 52,
    volumeScore: 58,
    fiftyTwoWeek: 72
  },
  {
    sym: "KO",
    name: "Coca-Cola",
    mascot: "KO",
    sector: "Beverage",
    price: 80.82,
    change: 0.46,
    pe: 24,
    growth: 5,
    yield: 2.8,
    moat: "Global brand and distribution",
    desc: "Beverages with one of the world's strongest brands and a huge distribution network.",
    since2010: 367,
    beta: 0.6,
    rsi: 55,
    volumeScore: 54,
    fiftyTwoWeek: 76
  },
  {
    sym: "JNJ",
    name: "Johnson & Johnson",
    mascot: "JN",
    sector: "Healthcare",
    price: 226.71,
    change: -1.77,
    pe: 17,
    growth: 4,
    yield: 3,
    moat: "Healthcare brands and scale",
    desc: "Medicines and medical technology with durable healthcare demand.",
    since2010: 464,
    beta: 0.7,
    rsi: 48,
    volumeScore: 57,
    fiftyTwoWeek: 69
  },
  {
    sym: "PG",
    name: "Procter & Gamble",
    mascot: "PG",
    sector: "Consumer",
    price: 141.57,
    change: -0.8,
    pe: 24,
    growth: 4,
    yield: 2.4,
    moat: "Household brands and shelf space",
    desc: "Everyday household products with repeat purchases and global brands.",
    since2010: 274,
    beta: 0.5,
    rsi: 45,
    volumeScore: 50,
    fiftyTwoWeek: 58
  },
  {
    sym: "WMT",
    name: "Walmart",
    mascot: "WM",
    sector: "Retail",
    price: 131.45,
    change: -0.76,
    pe: 31,
    growth: 5,
    yield: 0.9,
    moat: "Scale and low-cost logistics",
    desc: "Discount retail and groceries with huge scale, logistics, and everyday customer traffic.",
    since2010: 918,
    beta: 0.5,
    rsi: 57,
    volumeScore: 63,
    fiftyTwoWeek: 83
  },
  {
    sym: "JPM",
    name: "JPMorgan Chase",
    mascot: "JP",
    sector: "Banking",
    price: 297.81,
    change: -0.7,
    pe: 14,
    growth: 7,
    yield: 2,
    moat: "Scale and deposit base",
    desc: "Large bank with consumer banking, investment banking, cards, and asset management.",
    since2010: 953,
    beta: 1.1,
    rsi: 56,
    volumeScore: 68,
    fiftyTwoWeek: 82
  },
  {
    sym: "XOM",
    name: "Exxon Mobil",
    mascot: "XO",
    sector: "Energy",
    price: 157.92,
    change: 3.36,
    pe: 16,
    growth: 3,
    yield: 3.1,
    moat: "Scale and integrated energy assets",
    desc: "Oil, gas, refining, chemicals, and global energy infrastructure.",
    since2010: 320,
    beta: 1.0,
    rsi: 61,
    volumeScore: 72,
    fiftyTwoWeek: 79
  },
  {
    sym: "CVX",
    name: "Chevron",
    mascot: "CV",
    sector: "Energy",
    price: 191.1,
    change: 2.39,
    pe: 15,
    growth: 3,
    yield: 3.6,
    moat: "Energy reserves and capital discipline",
    desc: "Integrated energy company with upstream oil and gas, refining, and chemicals.",
    since2010: 363,
    beta: 1.0,
    rsi: 59,
    volumeScore: 65,
    fiftyTwoWeek: 73
  },
  {
    sym: "PFE",
    name: "Pfizer",
    mascot: "PF",
    sector: "Pharma",
    price: 25.33,
    change: -1.63,
    pe: 9,
    growth: 2,
    yield: 6.7,
    moat: "Drug portfolio and research pipeline",
    desc: "Pharmaceuticals with established medicines, vaccines, and research pipeline risk.",
    since2010: 180,
    beta: 0.7,
    rsi: 40,
    volumeScore: 70,
    fiftyTwoWeek: 34
  },
  {
    sym: "VZ",
    name: "Verizon",
    mascot: "VZ",
    sector: "Telecom",
    price: 46.37,
    change: -1.47,
    pe: 10,
    growth: 1,
    yield: 6.1,
    moat: "Wireless network and customer base",
    desc: "Wireless and broadband service with a large subscriber base and high infrastructure costs.",
    since2010: 248,
    beta: 0.4,
    rsi: 43,
    volumeScore: 60,
    fiftyTwoWeek: 52
  },
  {
    sym: "T",
    name: "AT&T",
    mascot: "T",
    sector: "Telecom",
    price: 24.03,
    change: -2.52,
    pe: 9,
    growth: 1,
    yield: 4.6,
    moat: "Wireless network and broadband footprint",
    desc: "Telecom provider with wireless, fiber broadband, and steady cash-flow focus.",
    since2010: 260,
    beta: 0.6,
    rsi: 41,
    volumeScore: 62,
    fiftyTwoWeek: 49
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

export type CompanySnapshot = {
  does: string;
  makesMoney: string;
  insight: string;
  digDeeper: string;
};

export const COMPANY_SNAPSHOTS: Record<string, CompanySnapshot> = {
  AAPL: {
    does: "Makes iPhones, Macs, wearables, apps, and services that work together.",
    makesMoney: "Sells devices first, then earns recurring money from App Store, iCloud, AppleCare, payments, and subscriptions.",
    insight: "Watch the ecosystem: loyal customers can make revenue steadier than a one-time gadget sale.",
    digDeeper: "Ask whether services growth can protect profits if iPhone upgrades slow."
  },
  AMZN: {
    does: "Runs online stores, delivery networks, cloud computing, ads, and Prime memberships.",
    makesMoney: "Collects retail margins, seller fees, Prime subscriptions, advertising fees, and high-margin AWS cloud revenue.",
    insight: "One ticker can hide several businesses; AWS and ads may matter more to profit than shopping volume.",
    digDeeper: "Compare Amazon's revenue growth with its operating profit to see which businesses carry earnings."
  },
  NFLX: {
    does: "Streams shows, movies, live events, and games to paying members around the world.",
    makesMoney: "Charges monthly subscriptions and earns some advertising revenue from lower-priced plans.",
    insight: "Content is both the product and the cost; great shows can build loyalty, but they are expensive.",
    digDeeper: "Check subscriber growth, price increases, and whether content spending turns into durable profit."
  },
  TSLA: {
    does: "Builds electric vehicles, batteries, charging products, and energy systems.",
    makesMoney: "Sells cars and energy products, plus software, charging, service, and regulatory credits.",
    insight: "High expectations can make valuation sensitive; growth must eventually show up as durable profit.",
    digDeeper: "Separate car margins from software and energy dreams before judging the stock."
  },
  GOOGL: {
    does: "Runs Google Search, YouTube, Android, Chrome, cloud services, maps, and AI tools.",
    makesMoney: "Mostly sells ads, with additional revenue from cloud subscriptions, app fees, hardware, and YouTube services.",
    insight: "Search is a powerful habit business, but AI could change how people find information.",
    digDeeper: "Study whether Cloud and AI can grow without weakening the core ad machine."
  },
  NVDA: {
    does: "Designs chips and software used for AI, data centers, gaming, graphics, and simulation.",
    makesMoney: "Sells GPUs, networking gear, systems, and software tools to cloud providers, companies, and gamers.",
    insight: "A great product can still be cyclical if customers overbuild; watch demand and supply together.",
    digDeeper: "Ask how long Nvidia's chip lead and CUDA software ecosystem can protect margins."
  },
  CSCO: {
    does: "Sells networking, security, collaboration, and infrastructure tools for businesses.",
    makesMoney: "Earns from hardware, software licenses, support contracts, subscriptions, and cybersecurity products.",
    insight: "Installed-base businesses can be steady because replacing core network equipment is hard.",
    digDeeper: "Check whether software and security growth can offset slower hardware cycles."
  },
  NKE: {
    does: "Designs and sells athletic shoes, apparel, and sports gear.",
    makesMoney: "Sells products through Nike stores, apps, wholesale retailers, and licensed brand deals.",
    insight: "Brand is the moat; inventory, fashion cycles, and competition can still pressure margins.",
    digDeeper: "Watch whether direct-to-consumer sales improve profit or create extra marketing costs."
  },
  DIS: {
    does: "Owns theme parks, movies, TV networks, streaming services, sports media, and character brands.",
    makesMoney: "Earns from parks, cruises, streaming subscriptions, ads, theater releases, licensing, and merchandise.",
    insight: "Disney's characters can be reused across parks, movies, and products, which is powerful when execution works.",
    digDeeper: "Compare parks cash flow with streaming profitability to see what funds the business."
  },
  SBUX: {
    does: "Operates coffee shops and sells packaged coffee, drinks, food, and rewards experiences.",
    makesMoney: "Makes money from company stores, licensed stores, packaged goods, and customer rewards spending.",
    insight: "A habit business can be valuable, but traffic, labor costs, and store experience matter.",
    digDeeper: "Look for same-store sales growth and whether price increases hurt visit frequency."
  },
  "BRK-B": {
    does: "Owns a collection of insurance, railroad, energy, manufacturing, retail, and investment businesses.",
    makesMoney: "Collects insurance float, operating profits, investment income, and cash flows from owned companies.",
    insight: "This is a portfolio inside one stock; capital allocation is the main skill to study.",
    digDeeper: "Learn how insurance float gives Berkshire cash to invest before claims are paid."
  },
  KO: {
    does: "Owns beverage brands and sells drink concentrates, syrups, and finished products worldwide.",
    makesMoney: "Earns from concentrate sales, bottling partnerships, licensing, and global distribution.",
    insight: "Small repeat purchases can create a huge business when brand and distribution are global.",
    digDeeper: "Ask how pricing power and volume growth work together in a mature consumer brand."
  },
  JNJ: {
    does: "Develops medicines and medical technology used by patients, doctors, and hospitals.",
    makesMoney: "Sells pharmaceuticals, medical devices, and healthcare products, often through long product cycles.",
    insight: "Healthcare demand can be steady, but patents, regulation, and lawsuits create special risks.",
    digDeeper: "Study patent cliffs: what happens when a drug loses exclusivity?"
  },
  PG: {
    does: "Sells everyday household and personal-care brands like detergents, diapers, razors, and hygiene products.",
    makesMoney: "Earns from repeat purchases through supermarkets, retailers, and online channels.",
    insight: "Everyday necessities can be defensive because people keep buying them in weak economies.",
    digDeeper: "Check whether brand strength lets P&G raise prices without losing customers."
  },
  WMT: {
    does: "Runs discount stores, grocery stores, e-commerce, delivery, memberships, and marketplace services.",
    makesMoney: "Earns from retail sales, grocery volume, marketplace fees, memberships, advertising, and financial services.",
    insight: "Scale is the moat; tiny margins can still create large profits when sales volume is enormous.",
    digDeeper: "Compare sales growth with operating margin to see how efficient Walmart is."
  },
  JPM: {
    does: "Provides banking, credit cards, loans, trading, investment banking, and asset management.",
    makesMoney: "Earns interest spreads, card fees, advisory fees, trading revenue, and asset-management fees.",
    insight: "Banks are confidence businesses; credit quality and interest rates can change results quickly.",
    digDeeper: "Learn net interest income and loan losses before judging bank profits."
  },
  XOM: {
    does: "Explores, produces, refines, transports, and sells oil, gas, fuels, chemicals, and energy products.",
    makesMoney: "Earns from commodity production, refining margins, chemicals, and global energy sales.",
    insight: "Energy profits can swing with oil and gas prices, so cash discipline matters.",
    digDeeper: "Ask how Exxon handles boom-and-bust cycles without overpaying for growth."
  },
  CVX: {
    does: "Produces oil and gas, refines fuels, sells energy products, and runs chemical operations.",
    makesMoney: "Earns from upstream production, refining, marketing, chemicals, and energy trading.",
    insight: "A dividend can look attractive, but it depends on cash flow through energy cycles.",
    digDeeper: "Study free cash flow after capital spending to judge dividend strength."
  },
  PFE: {
    does: "Researches, manufactures, and sells medicines and vaccines.",
    makesMoney: "Sells patented drugs, vaccines, specialty medicines, and new products from its research pipeline.",
    insight: "A low P/E can be a clue, but pharma investors must check whether future drugs replace fading ones.",
    digDeeper: "Compare current blockbuster drugs with the pipeline of medicines still in development."
  },
  VZ: {
    does: "Provides wireless phone service, broadband, business networking, and connectivity infrastructure.",
    makesMoney: "Collects monthly service bills, device payments, business contracts, and broadband fees.",
    insight: "Telecom can generate steady cash, but networks require huge spending to stay competitive.",
    digDeeper: "Ask whether cash flow covers network upgrades, debt, and dividends."
  },
  T: {
    does: "Provides wireless, fiber internet, broadband, and business connectivity services.",
    makesMoney: "Collects monthly wireless and broadband bills, device payments, and business service fees.",
    insight: "High yield can be tempting, but debt and capital spending can limit flexibility.",
    digDeeper: "Look at debt, free cash flow, and customer churn before trusting the dividend."
  },
  RBLX: {
    does: "Runs an online platform where users play, create, and share games and virtual worlds.",
    makesMoney: "Sells Robux virtual currency, creator marketplace items, ads, and platform services.",
    insight: "User growth is exciting, but the business must turn engagement into profitable cash flow.",
    digDeeper: "Check bookings, daily active users, and whether creator payouts leave enough profit."
  },
  SPOT: {
    does: "Streams music, podcasts, and audiobooks to free and paid users around the world.",
    makesMoney: "Earns from Premium subscriptions and advertising, then pays royalties to rights holders.",
    insight: "Scale helps, but royalty costs mean profit depends on pricing power and operating discipline.",
    digDeeper: "Ask how Spotify can improve margins while keeping artists, labels, and users happy."
  },
  DUOL: {
    does: "Provides language learning through a game-like app, subscriptions, tests, and learning tools.",
    makesMoney: "Earns from subscriptions, ads, certification tests, and in-app purchases.",
    insight: "A strong habit loop can lower marketing costs because users come back on their own.",
    digDeeper: "Study whether free users convert into paid subscribers without hurting growth."
  }
};

export function companySnapshotFor(stock: Pick<Stock, "sym" | "name" | "sector" | "desc" | "moat">): CompanySnapshot {
  return (
    COMPANY_SNAPSHOTS[stock.sym] ?? {
      does: stock.desc,
      makesMoney: "Uses its products or services to earn revenue. Research the annual report to see the exact mix.",
      insight: `${stock.sector} companies can look similar, but the moat matters: ${stock.moat}.`,
      digDeeper: `Ask BILL to explain ${stock.name}'s revenue, competitors, and biggest risk in simple terms.`
    }
  );
}

export const MAX_MARKET_YEAR = 2026;
export const SIMULATED_MARKET_DAY_MS = 5 * 60 * 1000;

type DailyPriceRow = [string, number];

// Split-adjusted daily close prices keep historical trades comparable across stock splits.
const DAILY_PRICES = dailyPrices as unknown as Record<string, DailyPriceRow[]>;
const MARKET_DATES = DAILY_PRICES.AAPL.map(([date]) => date);
export const MAX_MARKET_DATE = MARKET_DATES[MARKET_DATES.length - 1] ?? "2026-01-01";

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
          "Apple trades below peers",
          "Apple trades above peers",
          "Apple matches peer pricing",
          "P/E gives no clue"
        ],
        a: 1,
        exp: "A higher P/E means investors pay more per dollar of earnings."
      },
      {
        q: "What does margin of safety mean?",
        opts: [
          "Only buy famous brands",
          "Buy below estimated value",
          "Never sell any stock",
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
          "It shows trader interest",
          "It confirms move support",
          "It replaces earnings",
          "It sets price alone"
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
          "Cash paid versus price",
          "How fast revenue grows",
          "Whether price broke out",
          "How much CEOs earn"
        ],
        a: 0,
        exp: "Yield is annual dividend divided by stock price."
      },
      {
        q: "A payout ratio that is too high can be risky because:",
        opts: [
          "Future payments may strain",
          "Growth always stops",
          "Dividends become illegal",
          "No buyers remain"
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
          "To spot weakening trends",
          "To avoid all charts",
          "To collect dividend cash",
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

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function dateForYearStart(year: number) {
  return `${year}-01-01`;
}

function findFirstDateIndexOnOrAfter(date: string) {
  let low = 0;
  let high = MARKET_DATES.length - 1;
  let answer = MARKET_DATES.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (MARKET_DATES[mid] >= date) {
      answer = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return answer;
}

function findMarketDateIndexOnOrBefore(date: string) {
  let low = 0;
  let high = MARKET_DATES.length - 1;
  let answer = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (MARKET_DATES[mid] <= date) {
      answer = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return answer;
}

function findRowIndexOnOrBefore(rows: DailyPriceRow[], date: string) {
  let low = 0;
  let high = rows.length - 1;
  let answer = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (rows[mid][0] <= date) {
      answer = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return answer;
}

function findRowIndexOnOrAfter(rows: DailyPriceRow[], date: string) {
  let low = 0;
  let high = rows.length - 1;
  let answer = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (rows[mid][0] >= date) {
      answer = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return answer;
}

function getDailyPricePoint(sym: string, date: string) {
  const rows = DAILY_PRICES[sym] ?? [];
  const index = findRowIndexOnOrBefore(rows, date);
  if (index < 0) return null;
  return { date: rows[index][0], price: rows[index][1], index, rows };
}

function getBasePricePoint(sym: string, startYear: number, currentDate: string) {
  const rows = DAILY_PRICES[sym] ?? [];
  const index = findRowIndexOnOrAfter(rows, dateForYearStart(startYear));
  if (index < 0 || rows[index][0] > currentDate) return null;
  return { date: rows[index][0], price: rows[index][1], index, rows };
}

export function getSimulatedMarketDate(startYear: number, journeyStartedAt?: string | null, now = new Date()) {
  const startIndex = findFirstDateIndexOnOrAfter(dateForYearStart(startYear));
  if (!journeyStartedAt) return MARKET_DATES[startIndex] ?? MAX_MARKET_DATE;
  const started = new Date(journeyStartedAt);
  if (Number.isNaN(started.getTime())) return MARKET_DATES[startIndex] ?? MAX_MARKET_DATE;
  const elapsedMarketDays = Math.max(0, Math.floor((now.getTime() - started.getTime()) / SIMULATED_MARKET_DAY_MS));
  return MARKET_DATES[Math.min(MARKET_DATES.length - 1, startIndex + elapsedMarketDays)] ?? MAX_MARKET_DATE;
}

export function getSimulatedMarketDay(startYear: number, journeyStartedAt?: string | null, now = new Date()) {
  const startIndex = findFirstDateIndexOnOrAfter(dateForYearStart(startYear));
  if (!journeyStartedAt) return 1;
  const started = new Date(journeyStartedAt);
  if (Number.isNaN(started.getTime())) return 1;
  const elapsedMarketDays = Math.max(0, Math.floor((now.getTime() - started.getTime()) / SIMULATED_MARKET_DAY_MS));
  const currentIndex = Math.min(MARKET_DATES.length - 1, startIndex + elapsedMarketDays);
  return Math.max(1, currentIndex - startIndex + 1);
}

export function getSimulatedYear(startYear: number, journeyStartedAt?: string | null, now = new Date()) {
  return Number(getSimulatedMarketDate(startYear, journeyStartedAt, now).slice(0, 4));
}

export function getMarketDate(progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt">, now = new Date()) {
  return progress.gameMode === "live" ? MAX_MARKET_DATE : getSimulatedMarketDate(progress.startYear, progress.journeyStartedAt, now);
}

export function getMarketYear(progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt">, now = new Date()) {
  return Number(getMarketDate(progress, now).slice(0, 4));
}

function sampleRows(rows: DailyPriceRow[], maxPoints: number) {
  if (rows.length <= maxPoints) return rows;
  const sampled: DailyPriceRow[] = [];
  const step = (rows.length - 1) / (maxPoints - 1);
  for (let index = 0; index < maxPoints; index += 1) {
    sampled.push(rows[Math.round(index * step)]);
  }
  return sampled;
}

export function getStockChartData(
  sym: string,
  progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt">,
  now = new Date(),
  maxPoints = 120
) {
  const rows = DAILY_PRICES[sym] ?? [];
  if (!rows.length) return [];
  const marketDate = getMarketDate(progress, now);
  const currentIndex = findRowIndexOnOrBefore(rows, marketDate);
  if (currentIndex < 0) return [];

  const firstIndex = Math.max(0, currentIndex - 251);
  const visibleRows = rows.slice(firstIndex, currentIndex + 1);
  return sampleRows(visibleRows, maxPoints).map(([date, value]) => ({
    date,
    value: roundMoney(value)
  }));
}

export function getPortfolioChartData(
  progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt" | "customStocks" | "holdings">,
  now = new Date(),
  maxPoints = 80
) {
  const holdings = progress.holdings ?? [];
  if (!holdings.length) return [];

  const marketDate = getMarketDate(progress, now);
  const currentIndex = findMarketDateIndexOnOrBefore(marketDate);
  if (currentIndex < 0) return [];

  if (progress.gameMode === "live") {
    return [
      {
        year: marketDate,
        value: roundMoney(portfolioValueAtMarket(progress))
      }
    ];
  }

  const firstIndex = Math.max(0, currentIndex - 79);
  const chartRows: DailyPriceRow[] = MARKET_DATES.slice(firstIndex, currentIndex + 1).map((date) => [date, 0]);
  const sampledDates = sampleRows(chartRows, maxPoints).map(([date]) => date);

  return sampledDates.map((date) => {
    const value = holdings.reduce((sum, holding) => {
      const customStock = progress.customStocks?.find((stock) => stock.sym === holding.sym);
      if (customStock) return sum + customStock.price * holding.shares;
      const point = getDailyPricePoint(holding.sym, date);
      return sum + (point?.price ?? 0) * holding.shares;
    }, 0);

    return {
      year: date,
      value: roundMoney(value)
    };
  });
}

export function getMarketStocks(
  progress: Pick<GameProgressPayload, "gameMode" | "startYear" | "journeyStartedAt" | "customStocks">,
  now = new Date()
) {
  const marketDate = getMarketDate(progress, now);
  const stocks = new Map<string, Stock>();

  STOCKS.forEach((stock) => {
    if (progress.gameMode === "live") {
      stocks.set(stock.sym, stock);
      return;
    }

    const current = getDailyPricePoint(stock.sym, marketDate);
    if (!current) return;

    const previous = current.index > 0 ? current.rows[current.index - 1][1] : null;
    const base = getBasePricePoint(stock.sym, progress.startYear, current.date);
    const change = previous != null ? ((current.price - previous) / previous) * 100 : 0;
    const sinceStart = base?.price ? ((current.price - base.price) / base.price) * 100 : 0;

    stocks.set(stock.sym, {
      ...stock,
      price: roundMoney(current.price),
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
