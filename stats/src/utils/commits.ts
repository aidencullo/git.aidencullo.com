import { formatDateToTimeZone, getRelativeDate } from './dates';

export interface GitHubEvent {
  created_at: string;
}

export interface DailyCommitCounts {
  today: number;
  yesterday: number;
}

export function countCommitsForRecentDays(
  events: GitHubEvent[],
  now: Date = new Date(),
): DailyCommitCounts {
  const today = formatDateToTimeZone(now);
  const yesterday = formatDateToTimeZone(getRelativeDate(now, -1));

  return events.reduce<DailyCommitCounts>(
    (counts, event) => {
      const eventDate = formatDateToTimeZone(new Date(event.created_at));
      if (eventDate === today) {
        counts.today += 1;
      } else if (eventDate === yesterday) {
        counts.yesterday += 1;
      }
      return counts;
    },
    { today: 0, yesterday: 0 },
  );
}

