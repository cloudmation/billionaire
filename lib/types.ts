export type TabId = "home" | "market" | "learn" | "portfolio" | "ladder";

export type GameMode = "time-machine" | "live";

export type EraYear = 2000 | 2005 | 2010 | 2015 | 2020;

export type InvestmentStyleId =
  | "value"
  | "growth"
  | "technical"
  | "dividend"
  | "momentum";

export type ChatRole = "user" | "assistant";

export type Stock = {
  sym: string;
  name: string;
  mascot: string;
  sector: string;
  price: number;
  change: number;
  pe: number | null;
  growth: number;
  yield: number;
  moat: string;
  desc: string;
  since2010: number;
  beta: number;
  rsi: number;
  volumeScore: number;
  fiftyTwoWeek: number;
};

export type Milestone = {
  amount: number;
  label: string;
  title: string;
  badge: string;
  unlocks: string;
};

export type InvestmentStyle = {
  id: InvestmentStyleId;
  label: string;
  icon: string;
  color: string;
  tint: string;
  desc: string;
  who: string;
  question: string;
  metrics: string[];
  unlockedAt: number;
};

export type Concept = {
  term: string;
  short: string;
  simple: string;
};

export type Holding = {
  sym: string;
  shares: number;
  avgCost: number;
};

export type Trade = {
  id: string;
  sym: string;
  action: "buy" | "sell";
  shares: number;
  price: number;
  style: InvestmentStyleId | "quick";
  createdAt: string;
};

export type QuizQuestion = {
  q: string;
  opts: string[];
  a: number;
  exp: string;
};

export type Quiz = {
  topic: string;
  questions: QuizQuestion[];
};

export type QuizResult = {
  id: string;
  topic: string;
  questions?: string[];
  correct: number;
  total: number;
  reward: number;
  createdAt: string;
};

export type SideQuestResult = {
  id: string;
  questId: string;
  stockSym: string;
  answer: string;
  reward: number;
  createdAt: string;
};

export type StudiedConcept = {
  id: string;
  style: InvestmentStyleId;
  term: string;
  learnedOn: string;
  createdAt: string;
};

export type BillMessage = {
  role: ChatRole;
  content: string;
};

export type GameProgressPayload = {
  hasOnboarded: boolean;
  userName: string;
  playerAge: number;
  gameMode: GameMode;
  startYear: EraYear;
  journeyStartedAt: string | null;
  cash: number;
  lastCheckInDate: string | null;
  checkInStreak: number;
  holdings: Holding[];
  customStocks: Stock[];
  completedMissions: string[];
  studiedStyles: InvestmentStyleId[];
  studiedConcepts: StudiedConcept[];
  trades: Trade[];
  quizHistory: QuizResult[];
  sideQuestHistory: SideQuestResult[];
};

export type LeaderboardEntry = {
  rank: number;
  userName: string;
  netWorth: number;
  cash: number;
  stockValue: number;
  holdingsCount: number;
  completedMissions: number;
  quizCorrect: number;
  checkInStreak: number;
  updatedAt: string;
};
