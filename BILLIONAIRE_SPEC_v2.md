# BILLIONAIRE
### Product Development Specification v2.0
#### Updated: Web-First · Contextual Learning · AI-Powered Tutoring

---

## 1. Vision

**One sentence:** A web-based investing game where a 12-year-old learns to think like a real investor by actually investing — guided step-by-step by an AI tutor who teaches, quizzes, and challenges her at every decision.

**What changed in v2:** The game now teaches. Instead of just simulating trades, every trade becomes a mini-curriculum. She doesn't just buy Apple — she learns *why* a value investor buys Apple differently than a growth investor does. The AI doesn't just answer questions; it builds lessons, generates quizzes, and creates challenges in real time around what she's doing right now.

---

## 2. Platform: Web-First

| Priority | Platform | Notes |
|---|---|---|
| v1.0 | Web (Desktop) | Next.js, runs in browser, no install required |
| v1.1 | Web (Tablet responsive) | Same codebase, adapted layout |
| v2.0 | Mobile PWA | Progressive Web App, same codebase |
| v3.0 | Native iOS/Android | Optional, only if user demand warrants |

**Desktop minimum:** 1024px width. Designed at 1280px. Three-column layout.

---

## 3. Desktop Layout System

The entire application uses a persistent three-column shell:

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOP BAR: [BILLIONAIRE logo] [Year/Mode] [Net Worth] [Streak] [Milestone bar] │
├───────────────┬─────────────────────────────────────┬───────────────┤
│  LEFT SIDEBAR │  MAIN CONTENT AREA                  │  BILL PANEL   │
│  220px fixed  │  flex: 1, scrollable                │  300px fixed  │
│               │                                      │               │
│  Navigation   │  Changes per tab                    │  Always-on AI │
│  Learning     │                                      │  tutor chat   │
│  Progress     │                                      │  + quick      │
│  Today's XP   │                                      │    actions    │
└───────────────┴─────────────────────────────────────┴───────────────┘
```

### Left Sidebar Contents
- App logo + tagline
- Navigation (Home, Market, Learn, Portfolio, Ladder)
- Today's progress: missions completed, concepts learned
- Quick stats: current streak, trades remaining
- Learning path: currently studying what investing style

### Right BILL Panel (always visible on desktop)
- Persistent AI chat (Claude API)
- Context-aware: knows what screen you're on, what stock you're looking at
- Quick action buttons that change per screen:
  - On Market: "Explain this stock," "Quiz me on P/E ratios"
  - On Learn: "Give me a harder question," "Show me a real example"
  - On Portfolio: "Analyze my portfolio," "What should I rebalance?"
- Quiz card renders inline when AI generates one
- Typing indicator, message history preserved per session

---

## 4. The Learning Architecture

This is the core new system in v2. Learning is not a separate section — it is woven into every action.

### 4.1 Five Investment Philosophies

Each philosophy is a "style" the player can learn and apply. They unlock sequentially as the player's net worth grows, but can all be explored freely once unlocked.

| # | Style | Real-World Investor | Core Question | Unlocks At |
|---|---|---|---|---|
| 1 | Value Investing | Warren Buffett | Is this company worth more than its price? | $1K (start) |
| 2 | Growth Investing | Peter Lynch | Is this company growing faster than expected? | $10K |
| 3 | Technical Analysis | Paul Tudor Jones | What do the price patterns tell us? | $50K |
| 4 | Dividend Investing | John D. Rockefeller | Does this company pay me to own it? | $100K |
| 5 | Momentum Investing | Richard Driehaus | Is this stock moving and can I ride it? | $250K |

Each philosophy has:
- A **2-minute explainer** (video card style, animated concept)
- **5 core concepts** with definitions, examples, and "try it" exercises
- A **strategy card** summarizing the rules in plain language
- A **famous investor profile** (who made billions using this style)
- An **AI quiz track** — BILL generates fresh questions each time

### 4.2 The Five Core Concepts per Style

**Value Investing Concepts:**
1. P/E Ratio — "The price tag vs what you're getting"
2. Intrinsic Value — "What is this business actually worth?"
3. Margin of Safety — "Never pay full price"
4. Moat — "Why can't competitors copy them?"
5. Circle of Competence — "Invest in what you understand"

**Growth Investing Concepts:**
1. Revenue Growth Rate — "How fast is the top line growing?"
2. Total Addressable Market (TAM) — "How big can this get?"
3. Customer Acquisition Cost vs Lifetime Value
4. Rule of 40 — "Growth + profitability = health score"
5. Competitive positioning — "Are they winning or losing market share?"

**Technical Analysis Concepts:**
1. Support & Resistance — "The floor and ceiling of price"
2. Moving Averages (50-day, 200-day) — "The trend is your friend"
3. RSI (Relative Strength Index) — "Is this stock overbought or oversold?"
4. Volume — "Are people actually buying, or just talking?"
5. Candlestick Patterns — "Reading the emotional story of price"

**Dividend Investing Concepts:**
1. Dividend Yield — "How much do they pay per dollar invested?"
2. Payout Ratio — "Can they afford to keep paying?"
3. Dividend Growth Rate — "Is the payment growing every year?"
4. Dividend Aristocrats — "Companies that raised dividends 25+ years straight"
5. Compound reinvestment — "Dividends buying more shares, forever"

**Momentum Investing Concepts:**
1. Relative Strength — "Is this stock outperforming everything else?"
2. 52-Week High Breakout — "Breaking old ceilings becomes new floors"
3. Trend following vs mean reversion
4. Position sizing in momentum
5. Exit signals — "When does the momentum end?"

### 4.3 The Analysis Wizard (Core Learning Mechanic)

**When a player clicks any stock to trade, instead of a simple buy/sell screen, they enter the Analysis Wizard.**

This 5-step guided flow is the primary teaching mechanism of the entire app.

```
STEP 1: Choose Your Investing Lens
  "Which style do you want to use to analyze this stock?"
  [Value Investing] [Growth Investing] [Technical Analysis] [Dividend] [Momentum]
  → Brief 1-sentence reminder of what each style looks for

STEP 2: The Key Metrics (style-specific)
  → Show 3-4 real metrics for the selected stock (historical data)
  → Each metric has: label, value, plain-English explanation, color indicator
  → Example (Value): P/E = 28x (industry avg: 24x) — "This stock is slightly pricier than peers"
  → Animated reveal, one metric at a time

STEP 3: The Big Question
  → Based on the metrics shown, BILL poses a critical-thinking question:
    "Based on Apple's P/E of 28 vs the tech average of 24, do you think Apple is:
     A) Undervalued  B) Fairly Valued  C) Overvalued?"
  → Player answers → BILL explains why + what a real value investor would think
  → This is NOT graded — it's Socratic. The point is to reason, not pass.

STEP 4: BILL's Take
  → AI-generated 3-4 sentence analysis of this specific stock through the chosen lens
  → References the exact metrics just reviewed
  → Presents the bull case AND the bear case
  → Ends with: "What do YOU think? Trust your analysis."

STEP 5: Trade Decision + Micro-Quiz
  → Player chooses: Buy / Sell / Skip (I need to learn more)
  → After confirming, a 2-question AI-generated quiz tests retention:
    "What does a P/E ratio tell you?" + "Why might a high P/E not always be bad?"
  → Correct: net worth bonus. Incorrect: BILL explains and tries again.
```

**Why this works pedagogically:**
- Decision-making is the strongest memory anchor
- Player is emotionally invested (real money at stake) so they pay attention
- Each wizard run takes 3-4 minutes — about the length of focus a 12-year-old can sustain
- Over 50 trades, she'll have used all 5 styles and seen dozens of metrics in context

---

## 5. AI Tutor: BILL v2

### 5.1 BILL's Capabilities

BILL is not a chatbot. BILL is an active teaching system that can:

| Capability | How it works |
|---|---|
| **Answer questions** | Standard Claude chat, tuned to 12-year-old language |
| **Generate quizzes** | "Quiz me on value investing" → BILL creates 5 fresh questions with options |
| **Create challenges** | "Give me a challenge" → BILL invents a task: "Find me a dividend stock with yield > 3%" |
| **Debrief trades** | After every trade: "Let's review what just happened and why" |
| **Portfolio analysis** | "Analyze my portfolio" → BILL identifies concentration risk, suggests questions |
| **Socratic dialogue** | BILL asks questions to develop thinking, not just give answers |
| **Concept deep-dives** | "Tell me more about RSI" → BILL explains + shows example + offers quiz |
| **Historical lessons** | "What happened to tech stocks in 2000?" → narrative + lesson |
| **Adaptive difficulty** | BILL tracks what player has gotten right/wrong, adjusts complexity |

### 5.2 BILL's System Prompt Architecture

BILL's system prompt is dynamically constructed per interaction, injecting:
- Player's current net worth and milestone level
- Current game mode (Time Machine year or Live)
- Current holdings (so BILL can reference their actual portfolio)
- What screen/context the player is on
- Recent trade history (last 3 trades)
- Which investing styles have been studied
- Quiz performance history (what concepts they've struggled with)

This makes BILL feel like it knows the player personally.

### 5.3 Quiz Engine

BILL generates quizzes in a structured JSON format that renders as interactive UI:

```json
{
  "topic": "P/E Ratio",
  "difficulty": "beginner",
  "questions": [
    {
      "q": "If a stock has a P/E of 10 and earnings per share of $5, what is the stock price?",
      "options": ["$5", "$50", "$10", "$15"],
      "answer": 1,
      "explanation": "P/E × EPS = Price. 10 × $5 = $50. You're paying $50 for $5 of yearly earnings."
    }
  ]
}
```

Quiz types BILL can generate:
- **Concept check** — did you understand the lesson?
- **Apply to stock** — use the real stock's data to answer
- **Historical** — what happened in [year] and why?
- **Compare** — "Is Stock A or Stock B a better value investment?"
- **Predict** — "Based on these metrics, what do you think happened next?"

### 5.4 BILL's Personality Rules

- Talks to her like a knowledgeable older sibling — never condescending
- When she gets something wrong: never says "wrong" — says "Close! Here's the nuance…"
- References current cultural touchpoints (games, social media, celebrities) as analogies
- Occasionally asks "What do YOU think?" before giving the answer (Socratic)
- Has opinions: "Honestly? A lot of professional investors miss this too"
- Can be slightly sarcastic about bad trades — gently: "Bold move buying GameStop there 😬"
- Never gives specific financial advice — always frames as "here's how investors think about this"

---

## 6. Updated Screen Map

```
BILLIONAIRE (Web App)
│
├── Onboarding Flow
│   ├── Welcome screen (mode select)
│   ├── Time Machine: era select + story teaser
│   └── Live Mode: quick setup
│
├── [TOP BAR — persistent on all screens]
│   └── Logo | Year/Mode badge | Net Worth (animated) | Streak | Milestone progress bar
│
├── [LEFT SIDEBAR — persistent]
│   └── Nav | Daily progress | Streak | Learning path status
│
├── [RIGHT BILL PANEL — persistent on desktop]
│   └── Chat + contextual quick actions + quiz cards
│
├── 🏠 HOME
│   ├── Net Worth hero (large, animated)
│   ├── Year-in-Context card (Time Machine) or Market Flash (Live)
│   ├── Daily Missions (3) with progress
│   ├── Portfolio snapshot (mini)
│   └── BILL's tip of the day (pulled from AI on load)
│
├── 📊 MARKET
│   ├── Filter bar (sector, style-filter, search)
│   ├── Stock grid (card per stock: price, change, historical return, owned indicator)
│   ├── Click stock → Analysis Wizard (5-step overlay)
│   │   ├── Step 1: Choose investing style
│   │   ├── Step 2: Key metrics (style-specific)
│   │   ├── Step 3: The Big Question (Socratic)
│   │   ├── Step 4: BILL's Take (AI-generated)
│   │   └── Step 5: Trade Decision + Micro-Quiz
│   └── "Skip analysis → Quick Trade" (for experienced players)
│
├── 📚 LEARN
│   ├── My Learning Path (progress across 5 styles)
│   ├── Style Cards (Value / Growth / TA / Dividend / Momentum)
│   ├── Click style → Style Hub
│   │   ├── Style overview + famous investor
│   │   ├── 5 concept cards (tap to expand)
│   │   ├── "Practice with a real stock" → launches Analysis Wizard
│   │   └── "Quiz me on this" → BILL generates quiz
│   ├── My Quiz History (recent results)
│   └── BILL's Challenge of the Day
│
├── 💼 PORTFOLIO
│   ├── Net Worth chart (history graph)
│   ├── Holdings table (symbol, shares, cost, value, P&L, % of portfolio)
│   ├── Sector allocation chart
│   ├── Best trade / Worst trade
│   ├── Compare vs S&P 500
│   └── "Ask BILL to analyze my portfolio" button
│
├── 🏆 LADDER
│   ├── Visual milestone progression ($1K → $1B)
│   ├── Current position highlighted
│   ├── Each milestone: amount, title, emoji, what unlocks
│   ├── Distance to next milestone
│   └── Estimated time to reach at current growth rate
│
└── 👪 PARENT DASHBOARD (separate login)
    ├── Child's portfolio (read-only)
    ├── Concepts learned this week
    ├── Quiz scores and performance trends
    ├── Time spent, trades made
    └── "Learning Summary" — what has she actually learned?
```

---

## 7. Learning Progression System

Replace the simple milestone ladder with a two-axis progression:

**Axis 1: Wealth** — Net worth milestones ($1K → $1B) unlock new asset classes
**Axis 2: Knowledge** — Concept mastery unlocks deeper analytical tools

### Knowledge Badges (earned through quizzes and wizard completions)

| Badge | Requirement | Unlocks |
|---|---|---|
| 🌱 First Analysis | Complete Analysis Wizard once | See P/E data on all stocks |
| 📐 Metrics Reader | 10 wizard completions | Advanced metrics panel |
| 🎓 Value Scholar | Pass 5 value investing quizzes | Intrinsic value calculator tool |
| 📈 Chart Watcher | Complete TA module | Mini price chart on stock cards |
| 💡 Multi-Style | Use all 5 styles at least once | Style comparison view |
| 🏆 Analyst | 25 quizzes passed | "Pro" badge visible on portfolio |

---

## 8. Updated Technical Architecture

### 8.1 Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, fast, web-native, deploy to Vercel |
| Styling | Tailwind CSS + CSS Modules | Utility classes + custom design system |
| State | Zustand | Simple, performant global state |
| Database | Supabase (PostgreSQL) | Auth + real-time + storage |
| Auth | Supabase Auth + Google SSO | Easy parent/child account linking |
| Market Data (Live) | Polygon.io | Reliable, generous free tier |
| Market Data (Historical) | Tiingo / pre-cached DB | Pre-loaded, no runtime cost |
| AI Tutor | Anthropic Claude API (claude-sonnet-4-20250514) | Streaming responses, quiz generation |
| Charts | Recharts or Tremor | React-native charting |
| Animations | Framer Motion | Smooth, production-grade |
| Hosting | Vercel | Zero-config Next.js |
| Notifications | Resend (email) | Daily market flash digest |

### 8.2 AI Architecture

```
BILL Request Flow:
1. Player action (open stock, ask question, request quiz)
2. Client assembles context payload:
   { playerProfile, currentHoldings, currentScreen, 
     selectedStock, quizHistory, recentTrades, gameYear }
3. POST to /api/bill (Next.js route handler)
4. Route handler builds system prompt from context
5. Stream Claude response back to client
6. If response contains [QUIZ] tag: parse as quiz JSON, render quiz UI
7. If response contains [CHALLENGE] tag: parse and display mission card
8. Log interaction to Supabase for parent dashboard
```

### 8.3 Quiz JSON Contract

BILL signals quiz content with a special tag that the frontend parses:

```
[QUIZ]
{
  "topic": "P/E Ratio",
  "difficulty": "beginner",
  "questions": [
    {
      "q": "Apple's P/E is 28. The industry average is 24. This means Apple is:",
      "options": ["Cheaper than peers","More expensive than peers","The same as peers","Impossible to tell"],
      "answer": 1,
      "explanation": "P/E measures how much you pay per dollar of earnings. A higher P/E than peers means you're paying a premium — investors expect stronger future growth."
    }
  ]
}
[/QUIZ]
```

Frontend detects `[QUIZ]...[/QUIZ]`, strips it from chat text, renders interactive quiz card inline.

### 8.4 Pre-Cached Historical Data

For Time Machine mode, all stock data is pre-loaded into Supabase:
- Adjusted closing prices 2000–present for 50 stocks
- Pre-computed annual returns per stock per year
- Pre-written "Year in Review" narrative (AI-generated once, cached) for 2000–2023
- Pre-computed key metrics (P/E, revenue growth) per stock per year

This means Time Machine mode requires zero real-time API calls — it's instant.

---

## 9. MVP Scope (v1.0 — Web Desktop)

### Include in v1.0
- Web desktop app (Next.js)
- Time Machine mode: 2010 start, 20 US stocks
- Analysis Wizard (all 5 styles, steps 1–5)
- Value Investing + Growth Investing full lesson modules
- BILL chat (question answering + quiz generation)
- 2 quiz types: concept-check and apply-to-stock
- Home, Market, Learn (2 styles), Portfolio, Ladder screens
- Milestone ladder ($1K → $1M, first 4 tiers)
- Daily missions (hardcoded 3 per day)
- Login + save progress (Supabase)

### Exclude from v1.0
- Live Market mode
- TA + Dividend + Momentum lesson modules (data ready, UI not built)
- Parent dashboard
- Social/sharing features
- Mobile layout
- Push/email notifications
- Knowledge badges system
- Challenge generation (quiz only)

### Revised Timeline
| Phase | Duration | Deliverable |
|---|---|---|
| Design | 2 weeks | Figma file, full design system |
| Foundation | 2 weeks | Auth, layout shell, routing, BILL API |
| Time Machine | 3 weeks | Historical data, game loop, portfolio |
| Analysis Wizard | 3 weeks | All 5 styles, metrics, Socratic flow |
| Learn Hub (2 styles) | 2 weeks | Value + Growth modules |
| Quiz Engine | 1 week | BILL quiz generation + rendering |
| Polish + QA | 2 weeks | Animations, edge cases, testing |
| **Total** | **15 weeks** | **v1.0 web launch** |

---

## 10. Design Principles (Updated)

1. **The number is always visible.** Net worth lives in the top bar on every screen, always.
2. **Every trade is a teaching moment.** No trade happens without an analysis step.
3. **BILL is a coach, not a search engine.** He asks questions. He challenges. He adapts.
4. **Learning must feel like playing.** The Analysis Wizard is a game mechanic, not a lesson.
5. **Respect her intelligence.** She's 12, not 6. Treat her like a young investor who can handle real concepts.
6. **Make failure educational, not punishing.** A bad trade triggers a debrief, not a penalty.
7. **Desktop is primary.** Rich, information-dense UI appropriate for serious learning.
8. **AI is always one click away.** BILL is persistent, not buried in a sub-menu.

---

## 11. Key Open Questions for Product Team

1. Should the Analysis Wizard be skippable for "experienced" players, or always required?
2. Does BILL remember conversations across sessions, or reset daily?
3. How do we handle the parent/child account linking UX? Does a parent approve each trade?
4. What is the right daily mission refresh cadence — midnight UTC or per-user local time?
5. Should quiz performance affect net worth (bonus money for correct answers), or keep them separate?
6. Do we want a "class mode" for school use from the start, or is that a later product?

---

*BILLIONAIRE v2 — Where the game teaches and the AI coaches.*
