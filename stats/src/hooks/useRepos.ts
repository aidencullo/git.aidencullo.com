import { useState, useEffect } from 'react';

interface Repo {
  id: number;
  name: string;
  owner: {
    login: string;
  };
}

const BASE_URL = 'https://api.github.com/user/repos';

function buildRepoUrl(baseUrl: string, page: number): string {
  const urlParams = new URLSearchParams({ per_page: '100', page: page.toString() });
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

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setFetching(true);
        let page = 1;
        let url = buildRepoUrl(BASE_URL, page);

        while (true) {
          const data = await fetchGitHubData(url);
          const newRepos = data.filter((r: Repo) => r.owner.login === 'aidencullo');
          setRepos((prev) => {
            const ids = new Set(prev.map(r => r.id));
            return [...prev, ...newRepos.filter((r: Repo) => !ids.has(r.id))];
          });
          if (data.length === 0) {
            break;
          }
          page++;
          url = buildRepoUrl(BASE_URL, page);
        }
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchRepos();
  }, []);

  return { repos, fetching };
}

