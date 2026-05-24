# HRTech App by Serge

---

## Prerequisites

| Requirement      | Version / Description                                         |
| ---------------- | ------------------------------------------------------------- |
| Node.js          | >= 20.x                                                       |
| npm              | >= 10.x                                                       |
| Vercel CLI       | `npm i -g vercel`                                             |
| `OPENAI_API_KEY` | Get one at [platform.openai.com](https://platform.openai.com) |

---

## Running the app

```bash
npm i
npm run dev:api
```

> Make sure Vercel CLI is installed (`vercel --version`) and `OPENAI_API_KEY` is set in `.env`.

---

## Decisions

### Stack

| Library           | Why                                                                         |
| ----------------- | --------------------------------------------------------------------------- |
| React, TypeScript | Project requirement                                                         |
| Vite              | Fast bundler with flexible config, modern default, good DX                  |
| Zustand           | Lightweight state manager without boilerplate, modern default               |
| React Query       | Server state handling, modern default                                       |
| SCSS Modules      | Variables, mixins, modularity; doesn't bloat the JS bundle unlike CSS-in-JS |
| clsx              | Handy for dynamic class names                                               |
| react-hook-form   | Modern, flexible approach to forms                                          |
| zod               | Modern, flexible schema validation                                          |
| OpenAI            | Project requirement                                                         |
| vitest            | Unit testing, fits the Vite ecosystem natively                              |

### Architecture: Feature-Sliced Design (FSD)

A modern standard for scalable React apps. Keeps things strictly decomposed, loosely coupled, and easier to maintain.

```
src/
├── app/       # Bootstrap, providers, routing
├── pages/     # Pages (widget composition)
├── widgets/   # Self-contained UI blocks
├── features/  # User actions (use cases)
├── entities/  # Business entities
└── shared/    # Reusable UI, utilities, types
```

### AI tools

ChatGPT, Cursor w/ Claude Sonnet

---

## Design decisions

1. **"Home" button** — shows up in one spot next to the logo in the mockup; I think it's redundant. If you need a way home, making the logo clickable is the better move. _Skipped._
2. **Generate button** — the loader was there, but the color didn't really say "you can't click this." Added an explicit `disabled` state while generation is running.
3. **Transparent button** — styles for the `transparent` variant could use some work.
4. Everything else came down to making the UX a bit better.

---

## Code decisions

1. **Comments** — left in the app on purpose
2. **Side effects in the store** — not a big deal at this stage (browser-only, no backend). Once there's a server, swap this for `react-query` to handle server state.
3. **React Query** — one mutation for the whole app; the client doesn't need extra cache config, stale time, and so on. The mutation itself has _retry: false_ because retries are manual. If something fails here, the user should actually understand what went wrong.
4. **Storybook** — skipped on purpose: for a project this size and a solo dev, the cost isn't worth it. With a bigger team, I'd add it.
5. **Tests** — covered the bare minimum of the bare minimum; e2e is on hold. Same logic as Storybook: time vs. value at this stage.

---

## AI usage (required section as per the task)

1. **Design** — pasted page styles from Figma into AI and asked it to spot repeating patterns for a design system. Needed a review after the fact and again while building things out. Overall, good enough.
2. **Code** — set up a `.cursorrules.md` file with a strict "system" prompt based on the spec. Repeatedly told the AI not to hallucinate or invent APIs, and laid out hard rules for architecture, tooling, and how to work. Generated those rules with ChatGPT. When building features, I broke them down as much as I could, spelled out the solution, the API, and what I wanted in the end; when needed, I locked down context with the prompt; for trickier stuff, I discussed the approach first. Simple bugs got a "just do it properly" kind of message; slightly harder ones got a solution outline without going into every detail.
3. **README.md formatting** — handed off to AI
4. **Tests** — handed off to AI
