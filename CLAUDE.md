# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript + Vite dashboard application that displays GitHub commit statistics (commits today and yesterday) for user `aidencullo`.

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
stats/src/
├── main.tsx              # React DOM entry point
├── App.tsx               # Root component
├── components/
│   ├── Dashboard.tsx     # Main layout
│   └── CommitsStats.tsx  # Displays commit counts
├── hooks/
│   └── useCommits.ts     # Fetches GitHub events, returns {commitsToday, commitsYesterday, fetching}
├── utils/
│   ├── github.ts         # GitHub API helpers (buildUserEventsUrl, fetchGitHubJson)
│   ├── commits.ts        # countCommitsForRecentDays() - processes events into counts
│   └── dates.ts          # Date formatting with timezone support
└── constants/
    ├── github.ts         # GITHUB_USERNAME, API settings
    └── time.ts           # DEFAULT_TIME_ZONE (America/New_York), locale
```

**Data flow:** `CommitsStats` → `useCommits` hook → GitHub Events API → `countCommitsForRecentDays()`

## Environment Variables

Optional `VITE_GITHUB_TOKEN` in `stats/.env.local` for higher GitHub API rate limits. Without it, uses public API (60 requests/hour).

## Code Patterns

- Functional components with custom hooks for data fetching
- TypeScript strict mode enabled
- ESLint flat config (v9+) with React hooks and refresh plugins
- Husky pre-commit hook configured in `stats/.husky/pre-commit`
