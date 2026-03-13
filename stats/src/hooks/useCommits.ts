import { useEffect, useState } from 'react';

const USERNAME = 'aidencullo';
const DAYS = 30;
const PAGES = 3;

interface GitHubEvent {
  type: string;
  created_at: string;
  payload: { size?: number };
}

function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE'); // YYYY-MM-DD in local tz
}

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
      const counts = new Map<string, number>();

      try {
        for (let page = 1; page <= PAGES; page++) {
          const res = await fetch(
            `https://api.github.com/users/${USERNAME}/events?per_page=100&page=${page}`
          );
          if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
          const events: GitHubEvent[] = await res.json();
          if (events.length === 0) break;

          for (const e of events) {
            if (e.type !== 'PushEvent') continue;
            const date = toLocalDate(e.created_at);
            counts.set(date, (counts.get(date) ?? 0) + (e.payload.size ?? 1));
          }
        }
      } catch (err) {
        if (!cancelled) setStats(s => ({ ...s, loading: false, error: String(err) }));
        return;
      }

      if (cancelled) return;

      const dates = lastNDates(DAYS);
      const daily = dates.map(date => ({ date, count: counts.get(date) ?? 0 }));

      const today = counts.get(todayStr()) ?? 0;
      const thisWeek = daily.slice(-7).reduce((s, d) => s + d.count, 0);
      const currentMonth = todayStr().slice(0, 7);
      const thisMonth = daily
        .filter(d => d.date.startsWith(currentMonth))
        .reduce((s, d) => s + d.count, 0);

      // streak: consecutive days with commits going back from today (skip today if 0)
      let streak = 0;
      const reversed = [...daily].reverse();
      const start = reversed[0].count === 0 ? 1 : 0;
      for (let i = start; i < reversed.length; i++) {
        if (reversed[i].count > 0) streak++;
        else break;
      }

      setStats({ daily, today, thisWeek, thisMonth, streak, loading: false, error: null });
    }

    fetch_();
    return () => { cancelled = true; };
  }, []);

  return stats;
}
