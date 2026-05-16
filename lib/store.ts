"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_YEAR, INITIAL_HOLDINGS, QUIZ_CORRECT_REWARD, STARTING_CASH } from "./game-data";
import type {
  EraYear,
  GameMode,
  GameProgressPayload,
  Holding,
  InvestmentStyleId,
  QuizResult,
  Stock,
  Trade
} from "./types";

type GameState = GameProgressPayload & {
  hydrated: boolean;
  setHydrated: () => void;
  loadProgress: (progress: Partial<GameProgressPayload>) => void;
  setUserName: (userName: string) => void;
  setGameMode: (gameMode: GameMode) => void;
  startNewJourney: (input: { userName: string; startYear: EraYear; playerAge?: number }) => void;
  addCustomStock: (stock: Stock) => void;
  claimDailyCheckIn: () => { claimed: boolean; reward: number; streak: number; nextReward: number };
  buyStock: (input: {
    sym: string;
    shares: number;
    price: number;
    style: InvestmentStyleId | "quick";
  }) => void;
  sellStock: (input: {
    sym: string;
    shares: number;
    price: number;
    style: InvestmentStyleId | "quick";
  }) => void;
  completeMission: (id: string) => void;
  claimMissionReward: (id: string, reward: number) => boolean;
  resetTodayProgress: () => void;
  markStudied: (style: InvestmentStyleId) => void;
  rewardCorrectQuizAnswer: () => number;
  recordQuiz: (result: Omit<QuizResult, "id" | "createdAt">) => void;
  snapshot: () => GameProgressPayload;
};

function upsertHolding(holdings: Holding[], sym: string, shares: number, price: number) {
  const existing = holdings.find((holding) => holding.sym === sym);
  if (!existing) return [...holdings, { sym, shares, avgCost: price }];
  const totalShares = existing.shares + shares;
  const avgCost = (existing.avgCost * existing.shares + price * shares) / totalShares;
  return holdings.map((holding) =>
    holding.sym === sym ? { ...holding, shares: totalShares, avgCost } : holding
  );
}

function reduceHolding(holdings: Holding[], sym: string, shares: number) {
  return holdings
    .map((holding) =>
      holding.sym === sym ? { ...holding, shares: Math.max(0, holding.shares - shares) } : holding
    )
    .filter((holding) => holding.shares > 0);
}

function tradeId() {
  return `trade-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getLocalDateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function getPreviousLocalDateKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
}

export function getNextCheckInStreak(lastCheckInDate: string | null, currentStreak: number) {
  const today = getLocalDateKey();
  if (lastCheckInDate === today) return Math.max(1, currentStreak);
  if (lastCheckInDate === getPreviousLocalDateKey()) return Math.max(0, currentStreak) + 1;
  return 1;
}

export function getActiveCheckInStreak(lastCheckInDate: string | null, currentStreak: number) {
  const today = getLocalDateKey();
  if (lastCheckInDate === today || lastCheckInDate === getPreviousLocalDateKey()) {
    return Math.max(0, currentStreak);
  }
  return 0;
}

export function getDailyCheckInReward(streak: number) {
  return Math.min(500, 100 + (Math.max(1, streak) - 1) * 50);
}

const initialState: GameProgressPayload = {
  hasOnboarded: false,
  userName: "",
  playerAge: 12,
  gameMode: "time-machine",
  startYear: DEFAULT_YEAR,
  journeyStartedAt: null,
  cash: STARTING_CASH,
  lastCheckInDate: null,
  checkInStreak: 0,
  holdings: INITIAL_HOLDINGS,
  customStocks: [],
  completedMissions: [],
  studiedStyles: ["value"],
  trades: [],
  quizHistory: []
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      loadProgress: (progress) =>
        set((state) => ({
          ...state,
          ...progress,
          hasOnboarded: progress.hasOnboarded ?? state.hasOnboarded,
          userName: progress.userName ?? state.userName,
          playerAge: progress.playerAge ?? state.playerAge,
          gameMode: progress.gameMode ?? state.gameMode,
          startYear: progress.startYear ?? state.startYear,
          journeyStartedAt: progress.journeyStartedAt ?? null,
          lastCheckInDate: progress.lastCheckInDate ?? state.lastCheckInDate,
          checkInStreak: progress.checkInStreak ?? state.checkInStreak,
          holdings: progress.holdings ?? state.holdings,
          customStocks: progress.customStocks ?? state.customStocks,
          completedMissions: progress.completedMissions ?? state.completedMissions,
          studiedStyles: progress.studiedStyles ?? state.studiedStyles,
          trades: progress.trades ?? state.trades,
          quizHistory: progress.quizHistory ?? state.quizHistory
        })),
      setUserName: (userName) =>
        set({
          userName: userName.trim() || "Investor"
        }),
      setGameMode: (gameMode) =>
        set({
          gameMode
        }),
      startNewJourney: ({ userName, startYear, playerAge = 12 }) =>
        set({
          hasOnboarded: true,
          userName: userName.trim() || "Investor",
          playerAge,
          gameMode: "time-machine",
          startYear,
          journeyStartedAt: new Date().toISOString(),
          cash: STARTING_CASH,
          lastCheckInDate: null,
          checkInStreak: 0,
          holdings: [],
          customStocks: [],
          completedMissions: [],
          studiedStyles: ["value"],
          trades: [],
          quizHistory: []
        }),
      addCustomStock: (stock) =>
        set((state) => ({
          customStocks: [
            stock,
            ...state.customStocks.filter((candidate) => candidate.sym !== stock.sym)
          ].slice(0, 50)
        })),
      claimDailyCheckIn: () => {
        const state = get();
        const today = getLocalDateKey();
        const currentStreak = Math.max(0, state.checkInStreak);
        if (state.lastCheckInDate === today) {
          return {
            claimed: false,
            reward: 0,
            streak: currentStreak,
            nextReward: getDailyCheckInReward(currentStreak + 1)
          };
        }

        const nextStreak = getNextCheckInStreak(state.lastCheckInDate, currentStreak);
        const reward = getDailyCheckInReward(nextStreak);
        set({
          cash: state.cash + reward,
          lastCheckInDate: today,
          checkInStreak: nextStreak
        });
        return {
          claimed: true,
          reward,
          streak: nextStreak,
          nextReward: getDailyCheckInReward(nextStreak + 1)
        };
      },
      buyStock: ({ sym, shares, price, style }) =>
        set((state) => {
          const affordableShares = Math.floor(state.cash / price);
          if (affordableShares < 1) return state;
          const cappedShares = Math.max(1, Math.min(shares, affordableShares));
          const finalCost = cappedShares * price;
          const trade: Trade = {
            id: tradeId(),
            sym,
            action: "buy",
            shares: cappedShares,
            price,
            style,
            createdAt: new Date().toISOString()
          };
          return {
            cash: state.cash - finalCost,
            holdings: upsertHolding(state.holdings, sym, cappedShares, price),
            trades: [trade, ...state.trades].slice(0, 20),
            completedMissions: Array.from(new Set([...state.completedMissions, "analysis"])),
            studiedStyles: style === "quick" ? state.studiedStyles : Array.from(new Set([...state.studiedStyles, style]))
          };
        }),
      sellStock: ({ sym, shares, price, style }) =>
        set((state) => {
          const owned = state.holdings.find((holding) => holding.sym === sym)?.shares ?? 0;
          const cappedShares = Math.max(0, Math.min(shares, owned));
          if (!cappedShares) return state;
          const trade: Trade = {
            id: tradeId(),
            sym,
            action: "sell",
            shares: cappedShares,
            price,
            style,
            createdAt: new Date().toISOString()
          };
          return {
            cash: state.cash + cappedShares * price,
            holdings: reduceHolding(state.holdings, sym, cappedShares),
            trades: [trade, ...state.trades].slice(0, 20),
            completedMissions: Array.from(new Set([...state.completedMissions, "analysis"])),
            studiedStyles: style === "quick" ? state.studiedStyles : Array.from(new Set([...state.studiedStyles, style]))
          };
        }),
      completeMission: (id) =>
        set((state) => ({
          completedMissions: Array.from(new Set([...state.completedMissions, id]))
        })),
      claimMissionReward: (id, reward) => {
        const state = get();
        if (state.completedMissions.includes(id)) return false;
        set({
          cash: state.cash + reward,
          completedMissions: [...state.completedMissions, id]
        });
        return true;
      },
      resetTodayProgress: () =>
        set((state) => {
          const today = getLocalDateKey();
          return {
            completedMissions: [],
            trades: state.trades.filter((trade) => getLocalDateKey(new Date(trade.createdAt)) !== today),
            quizHistory: state.quizHistory.filter((quiz) => getLocalDateKey(new Date(quiz.createdAt)) !== today)
          };
        }),
      markStudied: (style) =>
        set((state) => ({
          studiedStyles: Array.from(new Set([...state.studiedStyles, style]))
        })),
      rewardCorrectQuizAnswer: () => {
        set((state) => ({ cash: state.cash + QUIZ_CORRECT_REWARD }));
        return QUIZ_CORRECT_REWARD;
      },
      recordQuiz: (result) =>
        set((state) => ({
          quizHistory: [
            {
              ...result,
              id: `quiz-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              createdAt: new Date().toISOString()
            },
            ...state.quizHistory
          ].slice(0, 12)
        })),
      snapshot: () => {
        const state = get();
        return {
          hasOnboarded: state.hasOnboarded,
          userName: state.userName,
          playerAge: state.playerAge,
          gameMode: state.gameMode,
          startYear: state.startYear,
          journeyStartedAt: state.journeyStartedAt,
          cash: state.cash,
          lastCheckInDate: state.lastCheckInDate,
          checkInStreak: state.checkInStreak,
          holdings: state.holdings,
          customStocks: state.customStocks,
          completedMissions: state.completedMissions,
          studiedStyles: state.studiedStyles,
          trades: state.trades,
          quizHistory: state.quizHistory
        };
      }
    }),
    {
      name: "billionaire-progress-v2",
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        userName: state.userName,
        playerAge: state.playerAge,
        gameMode: state.gameMode,
        startYear: state.startYear,
        journeyStartedAt: state.journeyStartedAt,
        cash: state.cash,
        lastCheckInDate: state.lastCheckInDate,
        checkInStreak: state.checkInStreak,
        holdings: state.holdings,
        customStocks: state.customStocks,
        completedMissions: state.completedMissions,
        studiedStyles: state.studiedStyles,
        trades: state.trades,
        quizHistory: state.quizHistory
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      }
    }
  )
);
