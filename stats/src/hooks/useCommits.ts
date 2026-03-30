import { useEffect, useState } from 'react';

const USERNAME = 'aidencullo';
const DAYS = 30;

function todayStr(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function lastNDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString('sv-SE');
  });
}

function tzOffset(): string {
  const offset = new Date().getTimezoneOffset();
  const sign = offset <= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const m = String(Math.abs(offset) % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

function dateToISO(date: string, end = false): string {
  const tz = tzOffset();
  return end ? `${date}T23:59:59${tz}` : `${date}T00:00:00${tz}`;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface CommitStats {
  daily: DailyCount[];
  today: number;
  thisWeek: number;
  thisMonth: number;
  streak: number;
  loading: boolean;
  error: string | null;
}

const GRAPHQL_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

async function fetchGitHub(token: string | undefined, from: string, to: string): Promise<Map<string, number>> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { login: USERNAME, from, to } }),
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);

  const days: { date: string; contributionCount: number }[] =
    json.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (w: { contributionDays: { date: string; contributionCount: number }[] }) => w.contributionDays
    );

  return new Map(days.map(d => [d.date, d.contributionCount]));
}

async function fetchGitLab(): Promise<Map<string, number>> {
  try {
    const res = await fetch(`https://gitlab.com/users/${USERNAME}/calendar.json`);
    if (!res.ok) return new Map();
    const json: Record<string, number> = await res.json();
    return new Map(Object.entries(json));
  } catch {
    // GitLab doesn't send CORS headers, so this fails from browser origins
    return new Map();
  }
}

export function useCommits(): CommitStats {
  const [stats, setStats] = useState<CommitStats>({
    daily: [],
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    streak: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetch_() {
      const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
      const dates = lastNDates(DAYS);
      const from = dateToISO(dates[0]);
      const to = dateToISO(todayStr(), true);

      try {
        const [ghCounts, glCounts] = await Promise.all([
          fetchGitHub(token, from, to),
          fetchGitLab(),
        ]);

        if (cancelled) return;

        const daily = dates.map(date => ({
          date,
          count: (ghCounts.get(date) ?? 0) + (glCounts.get(date) ?? 0),
        }));
        const today = daily[daily.length - 1].count;
        const thisWeek = daily.slice(-7).reduce((s, d) => s + d.count, 0);
        const currentMonth = todayStr().slice(0, 7);
        const thisMonth = daily
          .filter(d => d.date.startsWith(currentMonth))
          .reduce((s, d) => s + d.count, 0);

        let streak = 0;
        const reversed = [...daily].reverse();
        const start = reversed[0].count === 0 ? 1 : 0;
        for (let i = start; i < reversed.length; i++) {
          if (reversed[i].count > 0) streak++;
          else break;
        }

        setStats({ daily, today, thisWeek, thisMonth, streak, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setStats(s => ({ ...s, loading: false, error: String(err) }));
      }
    }

    fetch_();
    return () => { cancelled = true; };
  }, []);

  return stats;
}
