# BILLIONAIRE

A desktop-first investing game where a young player learns by analyzing stocks before trading, with BILL as an always-on AI investing coach.

## What Is Built

- Next.js App Router web app with a persistent top bar, left navigation, main content, and BILL panel.
- Home, Market, Learn, Portfolio, and Ladder screens.
- Five-step Analysis Wizard for every stock trade.
- Value and Growth learning modules, with preview data for the other investing styles.
- BILL chat route backed by OpenAI through `/api/bill`.
- Structured quiz parsing with inline quiz cards.
- Local file-backed progress and BILL interaction persistence under `.data/`.

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
```

`OPENAI_API_TOKEN`, `OpenAI_API_TOKEN`, and `OPENAI_API_KEY` are all supported by the server route.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
