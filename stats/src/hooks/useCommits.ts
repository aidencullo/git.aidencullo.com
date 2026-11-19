import { useEffect, useState } from 'react';

const DAYS = 30;

interface ContributionData {
  generatedAt: string;
  counts: Record<string, number>;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface CommitStats {
  daily: DailyCount[];
  today: number;
  todayDate: string;
  thisWeek: number;
  thisMonth: number;
  streak: number;
  loading: boolean;
  error: string | null;
}

async function fetchContributions(): Promise<ContributionData> {
  const res = await fetch('/contributions.json');
  if (!res.ok) throw new Error(`Contribution data returned ${res.status}`);
  return res.json();
}

export function useCommits(): CommitStats {
  const [stats, setStats] = useState<CommitStats>({
    daily: [],
    today: 0,
    todayDate: '',
    thisWeek: 0,
    thisMonth: 0,
    streak: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetch_() {
      try {
        const data = await fetchContributions();
        const counts = new Map(Object.entries(data.counts ?? {}));
        if (counts.size === 0) throw new Error('No contribution data available');

        const dates = [...counts.keys()].sort().slice(-DAYS);
        const daily = dates.map(date => ({ date, count: counts.get(date) ?? 0 }));
        const todayDate = dates[dates.length - 1];
        const today = counts.get(todayDate) ?? 0;
        const thisWeek = daily.slice(-7).reduce((s, d) => s + d.count, 0);
        const currentMonth = todayDate.slice(0, 7);
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

        if (!cancelled) {
          setStats({
            daily,
            today,
            todayDate,
            thisWeek,
            thisMonth,
            streak,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) setStats(s => ({ ...s, loading: false, error: String(err) }));
      }
    }

    fetch_();
    return () => { cancelled = true; };
  }, []);

  return stats;
}
