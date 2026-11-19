# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript + Vite dashboard application that displays daily GitHub + GitLab commit counts for user `aidencullo`.

## Commands

All commands run from the `stats/` directory:

```bash
npm run dev      # Start dev server with HMR (auto-opens browser)
npm run build    # TypeScript check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

```
stats/
├── src/
│   ├── main.tsx              # React DOM entry point
│   ├── App.tsx               # Root component
│   ├── components/
│   │   └── Dashboard.tsx     # Main layout
│   └── hooks/
│       └── useCommits.ts     # Loads /contributions.json, computes stats
├── scripts/
│   └── fetch-contributions.mjs  # Build-time fetch using GITHUB_TOKEN
└── public/
    └── contributions.json    # Generated data served by GitHub Pages
```

**Data flow:** Actions workflow → `fetch-contributions.mjs` (GitHub GraphQL + GitLab calendar) → `public/contributions.json` → `useCommits` hook → `Dashboard`. The browser never calls the GitHub API directly.

## Data generation

`stats/scripts/fetch-contributions.mjs` runs during the Pages workflow (hourly, on push, and via `workflow_dispatch`). It uses the workflow's built-in `GITHUB_TOKEN` to query GitHub's GraphQL `contributionsCollection` for the last 30 days, merges GitLab's public contribution calendar, and writes `stats/public/contributions.json`.

## useCommits Hook Logic

`stats/src/hooks/useCommits.ts` fetches the static `/contributions.json` from the same origin, then derives `today`, `thisWeek`, `thisMonth`, and `streak` from the most recent 30 days of counts. No API token is used in the browser.

## Environment Variables

- `GITHUB_TOKEN` — provided automatically by GitHub Actions to the fetch script. No token is bundled into client-side code.
- For local regeneration of `stats/public/contributions.json`, run `GITHUB_TOKEN=<your token> node scripts/fetch-contributions.mjs` from `stats/`. Without a token it writes empty counts.

## Code Patterns

- Functional components with custom hooks for data fetching
- TypeScript strict mode enabled
- ESLint flat config (v9+) with React hooks and refresh plugins
- Husky pre-commit hook configured in `stats/.husky/pre-commit`
