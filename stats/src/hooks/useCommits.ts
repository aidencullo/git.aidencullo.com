import { useEffect, useState } from 'react';

const DAYS = 30;

interface ContributionData {
  generatedAt: string;
  github: Record<string, number>;
  gitlab: Record<string, number>;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface SourceStats {
  daily: DailyCount[];
  today: number;
  todayDate: string;
  thisWeek: number;
  thisMonth: number;
  streak: number;
}

export interface CommitStats {
  github: SourceStats;
  gitlab: SourceStats;
  loading: boolean;
  error: string | null;
}

const EMPTY_STATS: SourceStats = {
  daily: [],
  today: 0,
  todayDate: '',
  thisWeek: 0,
  thisMonth: 0,
  streak: 0,
};

async function fetchContributions(): Promise<ContributionData> {
  const res = await fetch('/contributions.json');
  if (!res.ok) throw new Error(`Contribution data returned ${res.status}`);
  return res.json();
}

function summarize(counts: Record<string, number> | undefined): SourceStats {
  if (!counts || Object.keys(counts).length === 0) return EMPTY_STATS;

  const map = new Map(Object.entries(counts));
  const dates = [...map.keys()].sort().slice(-DAYS);
  const daily = dates.map(date => ({ date, count: map.get(date) ?? 0 }));
  const todayDate = dates[dates.length - 1];
  const today = map.get(todayDate) ?? 0;
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

  return { daily, today, todayDate, thisWeek, thisMonth, streak };
}

export function useCommits(): CommitStats {
  const [stats, setStats] = useState<CommitStats>({
    github: EMPTY_STATS,
    gitlab: EMPTY_STATS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetch_() {
      try {
        const data = await fetchContributions();
        if (!data.github && !data.gitlab) throw new Error('No contribution data available');

        if (!cancelled) {
          setStats({
            github: summarize(data.github),
            gitlab: summarize(data.gitlab),
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
