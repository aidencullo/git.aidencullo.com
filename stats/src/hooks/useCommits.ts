import { useEffect, useState } from 'react';
import { countCommitsForRecentDays } from '../utils/commits';
import type { GitHubEvent } from '../utils/commits';
import { buildUserEventsUrl, fetchGitHubJson } from '../utils/github';

const EVENTS_URL = buildUserEventsUrl();

export function useCommits() {
  const [commitsToday, setCommitsToday] = useState(0);
  const [commitsYesterday, setCommitsYesterday] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchEvents = async () => {
      try {
        setFetching(true);
        const events = await fetchGitHubJson<GitHubEvent[]>(EVENTS_URL);
        if (isCancelled) {
          return;
        }

        const { today, yesterday } = countCommitsForRecentDays(events);
        setCommitsToday(today);
        setCommitsYesterday(yesterday);
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching commits:', error);
        }
      } finally {
        if (!isCancelled) {
          setFetching(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { commitsToday, commitsYesterday, fetching };
}

