export type TabId = "home" | "market" | "learn" | "portfolio" | "ladder";

export type GameMode = "time-machine" | "live";

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
  correct: number;
  total: number;
  createdAt: string;
};

export type BillMessage = {
  role: ChatRole;
  content: string;
};

export type GameProgressPayload = {
  userName: string;
  gameMode: GameMode;
  cash: number;
  holdings: Holding[];
  completedMissions: string[];
  studiedStyles: InvestmentStyleId[];
  trades: Trade[];
  quizHistory: QuizResult[];
};
