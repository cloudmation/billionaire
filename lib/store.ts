"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_HOLDINGS, STARTING_CASH } from "./game-data";
import type {
  GameMode,
  GameProgressPayload,
  Holding,
  InvestmentStyleId,
  QuizResult,
  Trade
} from "./types";

type GameState = GameProgressPayload & {
  hydrated: boolean;
  setHydrated: () => void;
  loadProgress: (progress: Partial<GameProgressPayload>) => void;
  setUserName: (userName: string) => void;
  setGameMode: (gameMode: GameMode) => void;
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
  resetTodayProgress: () => void;
  markStudied: (style: InvestmentStyleId) => void;
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

const initialState: GameProgressPayload = {
  userName: "Sophia",
  gameMode: "time-machine",
  cash: STARTING_CASH,
  holdings: INITIAL_HOLDINGS,
  completedMissions: ["analysis", "concepts"],
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
          userName: progress.userName ?? state.userName,
          gameMode: progress.gameMode ?? state.gameMode,
          holdings: progress.holdings ?? state.holdings,
          completedMissions: progress.completedMissions ?? state.completedMissions,
          studiedStyles: progress.studiedStyles ?? state.studiedStyles,
          trades: progress.trades ?? state.trades,
          quizHistory: progress.quizHistory ?? state.quizHistory
        })),
      setUserName: (userName) =>
        set({
          userName: userName.trim() || "Sophia"
        }),
      setGameMode: (gameMode) =>
        set({
          gameMode
        }),
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
      resetTodayProgress: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          return {
            completedMissions: [],
            trades: state.trades.filter((trade) => trade.createdAt.slice(0, 10) !== today),
            quizHistory: state.quizHistory.filter((quiz) => quiz.createdAt.slice(0, 10) !== today)
          };
        }),
      markStudied: (style) =>
        set((state) => ({
          studiedStyles: Array.from(new Set([...state.studiedStyles, style]))
        })),
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
          userName: state.userName,
          gameMode: state.gameMode,
          cash: state.cash,
          holdings: state.holdings,
          completedMissions: state.completedMissions,
          studiedStyles: state.studiedStyles,
          trades: state.trades,
          quizHistory: state.quizHistory
        };
      }
    }),
    {
      name: "billionaire-progress",
      partialize: (state) => ({
        userName: state.userName,
        gameMode: state.gameMode,
        cash: state.cash,
        holdings: state.holdings,
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
