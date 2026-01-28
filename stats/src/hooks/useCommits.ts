import { useEffect, useState } from 'react';
import { fetchGitHubGraphQL } from '../utils/github';
import { formatDateToISO, getRelativeDate } from '../utils/dates';

interface RepoNode {
  name: string;
  defaultBranchRef: {
    target: {
      history: {
        totalCount: number;
      };
    };
  } | null;
}

interface GraphQLResponse {
  viewer: {
    id: string;
    repositories: {
      nodes: RepoNode[];
    };
  };
}

function buildCommitsQuery(sinceDate: string, authorId?: string): string {
  const authorFilter = authorId ? `, author: {id: "${authorId}"}` : '';
  return `{
    viewer {
      id
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
        nodes {
          name
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1, since: "${sinceDate}"${authorFilter}) {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
  }`;
}

export function useCommits() {
  const [commitsToday, setCommitsToday] = useState(0);
  const [commitsYesterday, setCommitsYesterday] = useState(0);
  const [repoCount, setRepoCount] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchCommits = async () => {
      try {
        setFetching(true);

        const now = new Date();
        const todayStr = formatDateToISO(now);
        const yesterdayDate = getRelativeDate(now, -1);
        const yesterdayStr = formatDateToISO(yesterdayDate);

        // First query to get viewer ID
        const initialData = await fetchGitHubGraphQL<GraphQLResponse>(
          buildCommitsQuery(`${todayStr}T00:00:00Z`)
        );
        const viewerId = initialData.viewer.id;

        // Query with author filter
        const [todayData, yesterdayData] = await Promise.all([
          fetchGitHubGraphQL<GraphQLResponse>(buildCommitsQuery(`${todayStr}T00:00:00Z`, viewerId)),
          fetchGitHubGraphQL<GraphQLResponse>(buildCommitsQuery(`${yesterdayStr}T00:00:00Z`, viewerId)),
        ]);

        if (isCancelled) return;

        const todayTotal = todayData.viewer.repositories.nodes.reduce((sum, repo) => {
          return sum + (repo.defaultBranchRef?.target?.history?.totalCount ?? 0);
        }, 0);

        const yesterdayTotal = yesterdayData.viewer.repositories.nodes.reduce((sum, repo) => {
          return sum + (repo.defaultBranchRef?.target?.history?.totalCount ?? 0);
        }, 0);

        const reposWithCommitsToday = todayData.viewer.repositories.nodes.filter(
          repo => (repo.defaultBranchRef?.target?.history?.totalCount ?? 0) > 0
        ).length;

        setCommitsToday(todayTotal);
        setCommitsYesterday(yesterdayTotal - todayTotal);
        setRepoCount(reposWithCommitsToday);
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

