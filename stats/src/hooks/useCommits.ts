import { useEffect, useState } from 'react';
import {
  countCommitsForRecentDays,
  toGitHubCommitItems,
  toGitLabCommitItems,
} from '../utils/commits';
import type { GitHubEvent, GitLabCommit } from '../utils/commits';
import { buildUserEventsUrl, fetchGitHubJson } from '../utils/github';
import { buildProjectCommitsUrl, fetchGitLabJson, getGitLabProjectIds } from '../utils/gitlab';

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
        const now = new Date();
        const since = new Date(now);
        since.setDate(since.getDate() - 2);

        const [githubEvents, gitlabCommitsLists] = await Promise.all([
          fetchGitHubJson<GitHubEvent[]>(EVENTS_URL),
          Promise.all(
            getGitLabProjectIds().map((projectId) =>
              fetchGitLabJson<GitLabCommit[]>(buildProjectCommitsUrl(projectId, since)),
            ),
          ),
        ]);

        if (isCancelled) {
          return;
        }

        const githubItems = toGitHubCommitItems(githubEvents);
        const gitlabItems = toGitLabCommitItems(gitlabCommitsLists.flat());
        const { today, yesterday } = countCommitsForRecentDays([...githubItems, ...gitlabItems], now);
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

