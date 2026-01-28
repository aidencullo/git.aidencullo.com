import { formatDateToTimeZone, getRelativeDate } from './dates';

export interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: {
    commits?: unknown[];
  };
}

export interface GitLabCommit {
  committed_date?: string;
  authored_date?: string;
  created_at?: string;
}

export interface DailyCommitCounts {
  today: number;
  yesterday: number;
}

export interface DatedCountItem {
  date: string;
  count: number;
}

export function toGitHubCommitItems(events: GitHubEvent[]): DatedCountItem[] {
  return events
    .filter((e) => e.type === 'PushEvent')
    .map((e) => ({
      date: e.created_at,
      count: e.payload?.commits?.length ?? 0,
    }))
    .filter((i) => i.count > 0);
}

export function toGitLabCommitItems(commits: GitLabCommit[]): DatedCountItem[] {
  return commits.map((c) => ({
    date: c.committed_date ?? c.authored_date ?? c.created_at ?? new Date(0).toISOString(),
    count: 1,
  }));
}

export function countCommitsForRecentDays(
  items: DatedCountItem[],
  now: Date = new Date(),
): DailyCommitCounts {
  const today = formatDateToTimeZone(now);
  const yesterday = formatDateToTimeZone(getRelativeDate(now, -1));

  return items.reduce<DailyCommitCounts>(
    (counts, item) => {
      const itemDate = formatDateToTimeZone(new Date(item.date));
      if (itemDate === today) {
        counts.today += item.count;
      } else if (itemDate === yesterday) {
        counts.yesterday += item.count;
      }
      return counts;
    },
    { today: 0, yesterday: 0 },
  );
}

