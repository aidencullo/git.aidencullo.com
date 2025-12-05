import { useState, useEffect } from 'react';

interface Repo {
  id: number;
  name: string;
  owner: {
    login: string;
  };
}

// Constants
const BASE_URL = 'https://api.github.com/user/repos';
const USERNAME = 'aidencullo';
const PER_PAGE = 100;
const INITIAL_PAGE = 1;

// Helper Functions
function buildRepoUrl(baseUrl: string, page: number): string {
  const urlParams = new URLSearchParams({
    per_page: PER_PAGE.toString(),
    page: page.toString(),
  });
  return `${baseUrl}?${urlParams.toString()}`;
}

async function fetchGitHubData(url: string): Promise<Repo[]> {
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    },
  });
  return response.json();
}

function filterReposByOwner(repos: Repo[], owner: string): Repo[] {
  return repos.filter((repo) => repo.owner.login === owner);
}

// Main Hook
export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchAllRepos = async () => {
      try {
        setFetching(true);
        let currentPage = INITIAL_PAGE;
        let hasMorePages = true;

        while (hasMorePages) {
          const url = buildRepoUrl(BASE_URL, currentPage);
          const pageData = await fetchGitHubData(url);
          const filteredRepos = filterReposByOwner(pageData, USERNAME);

          setRepos((prevRepos) => [...prevRepos, ...filteredRepos]);

          hasMorePages = pageData.length > 0;
          if (hasMorePages) {
            currentPage++;
          }
        }
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchAllRepos();
  }, []);

  return { repos, fetching };
}

