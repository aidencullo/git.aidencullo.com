import { useState, useEffect } from 'react';

interface Repo {
  id: number;
  name: string;
  owner: {
    login: string;
  };
}

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      setFetching(true);
      const baseUrl = 'https://api.github.com/user/repos';
      let page = 1;
      let urlParams = new URLSearchParams({ per_page: '100', page: page.toString() });
      let url = `${baseUrl}?${urlParams.toString()}`;

      while (true) {
        const response = await fetch(url, {
          headers: {
            Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          },
        });
        const data = await response.json();
        const newRepos = data.filter((r: Repo) => r.owner.login === 'aidencullo');
        setRepos((prev) => {
          const ids = new Set(prev.map(r => r.id));
          return [...prev, ...newRepos.filter((r: Repo) => !ids.has(r.id))];
        });
        if (data.length === 0) {
          break;
        }
        page++;
        urlParams = new URLSearchParams({ per_page: '100', page: page.toString() });
        url = `${baseUrl}?${urlParams.toString()}`;
      }
      setFetching(false);
    };
    try {
      fetchRepos();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setRepos([]);
    }
  }, []);

  return { repos, fetching };
}

