# BILLIONAIRE

A desktop-first investing game where a young player learns by analyzing stocks before trading, with BILL as an always-on AI investing coach.

## What Is Built

- Next.js App Router web app with a persistent top bar, left navigation, main content, and BILL panel.
- Home, Market, Learn, Portfolio, and Ladder screens.
- Time Machine and Live Market mode picker.
- Player progress tracked by user name.
- Five-step Analysis Wizard for every stock trade.
- Value and Growth learning modules, with preview data for the other investing styles.
- BILL chat route backed by OpenAI through `/api/bill`.
- Structured quiz parsing with inline quiz cards.
- Neon Postgres progress and BILL interaction persistence when `DATABASE_URL` is set, with a local `.data/` fallback for development.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env` from `.env.example` and set:

```bash
OpenAI_API_TOKEN=...
OPENAI_MODEL=gpt-5.2
DATABASE_URL=postgresql://...
```

`OPENAI_API_TOKEN`, `OpenAI_API_TOKEN`, and `OPENAI_API_KEY` are all supported by the server route.

`DATABASE_URL` should be the pooled Neon Postgres connection string from the Neon dashboard. If it is omitted, the app stores progress locally in `.data/`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
