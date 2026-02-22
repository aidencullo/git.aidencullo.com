import { useEffect, useState } from 'react';
import { fetchGitHubGraphQL } from '../utils/github';
import { formatDateToISO, getRelativeDate } from '../utils/dates';

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface CommitContribution {
  contributions: {
    totalCount: number;
  };
}

interface GraphQLResponse {
  viewer: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: Array<{
          contributionDays: ContributionDay[];
        }>;
      };
      commitContributionsByRepository: CommitContribution[];
    };
  };
}

interface CommitsSnapshot {
  commitsToday: number;
  commitsYesterday: number;
  repoCount: number;
  fetchedAt: number;
}

const CACHE_KEY = 'commits-snapshot-v1';
const CACHE_TTL_MS = 60_000;

function buildCommitsQuery(fromDate: string): string {
  return `query {
    viewer {
      contributionsCollection(from: "${fromDate}T00:00:00Z") {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          contributions {
            totalCount
          }
        }
      }
    }
  }`;
}

function readCache(): CommitsSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CommitsSnapshot;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCache(snapshot: Omit<CommitsSnapshot, 'fetchedAt'>) {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...snapshot, fetchedAt: Date.now() })
    );
  } catch {
    // Ignore storage failures.
  }
}

function extractCounts(
  weeks: Array<{ contributionDays: ContributionDay[] }>,
  todayISO: string,
  yesterdayISO: string,
) {
  let commitsToday = 0;
  let commitsYesterday = 0;

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.date === todayISO) {
        commitsToday = day.contributionCount;
      } else if (day.date === yesterdayISO) {
        commitsYesterday = day.contributionCount;
      }
    }
  }

  return { commitsToday, commitsYesterday };
}

export function useCommits() {
  const [commitsToday, setCommitsToday] = useState(0);
  const [commitsYesterday, setCommitsYesterday] = useState(0);
  const [repoCount, setRepoCount] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const cached = readCache();
    if (cached) {
      setCommitsToday(cached.commitsToday);
      setCommitsYesterday(cached.commitsYesterday);
      setRepoCount(cached.repoCount);
    }

    const fetchCommits = async () => {
      try {
        if (!cached) {
          setFetching(true);
        }

        const now = new Date();
        const todayISO = formatDateToISO(now);
        const yesterdayISO = formatDateToISO(getRelativeDate(now, -1));
        const fromISO = formatDateToISO(getRelativeDate(now, -6));

        const data = await fetchGitHubGraphQL<GraphQLResponse>(buildCommitsQuery(fromISO));
        if (isCancelled) {
          return;
        }

        const weeks = data.viewer.contributionsCollection.contributionCalendar.weeks;
        const { commitsToday: todayCount, commitsYesterday: yesterdayCount } = extractCounts(
          weeks,
          todayISO,
          yesterdayISO,
        );

        const repoContributions = data.viewer.contributionsCollection.commitContributionsByRepository;
        const reposWithCommitsToday = repoContributions.filter(
          repo => repo.contributions.totalCount > 0,
        ).length;

        setCommitsToday(todayCount);
        setCommitsYesterday(yesterdayCount);
        setRepoCount(reposWithCommitsToday);
        writeCache({
          commitsToday: todayCount,
          commitsYesterday: yesterdayCount,
          repoCount: reposWithCommitsToday,
        });
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

    fetchCommits();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { commitsToday, commitsYesterday, repoCount, fetching };
}
