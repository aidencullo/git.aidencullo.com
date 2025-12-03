import { useState, useEffect } from 'react';

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export function useCommits() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setFetching(true);
        const baseUrl = 'https://api.github.com/user/repos';
        let page = 1;
        let urlParams = new URLSearchParams({ per_page: '100', page: page.toString() });
        let url = `${baseUrl}?${urlParams.toString()}`;
        const allRepos: Array<{ owner: { login: string }; name: string }> = [];

        // First, fetch all repos
        while (true) {
          const response = await fetch(url, {
            headers: {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            },
          });
          const data = await response.json();
          const newRepos = data.filter((r: { owner: { login: string } }) => r.owner.login === 'aidencullo');
          allRepos.push(...newRepos);
          if (data.length === 0) {
            break;
          }
          page++;
          urlParams = new URLSearchParams({ per_page: '100', page: page.toString() });
          url = `${baseUrl}?${urlParams.toString()}`;
        }

        // Then fetch commits from all repos
        const allCommits: Commit[] = [];
        for (const repo of allRepos) {
          let commitPage = 1;
          while (true) {
            const commitUrlParams = new URLSearchParams({ per_page: '100', page: commitPage.toString() });
            const commitUrl = `https://api.github.com/repos/aidencullo/${repo.name}/commits?${commitUrlParams.toString()}`;
            const commitResponse = await fetch(commitUrl, {
              headers: {
                Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
              },
            });
            const commitData = await commitResponse.json();
            if (commitData.length === 0) {
              break;
            }
            allCommits.push(...commitData);
            commitPage++;
          }
        }

        setCommits((prev) => {
          const shas = new Set(prev.map(c => c.sha));
          return [...prev, ...allCommits.filter((c: Commit) => !shas.has(c.sha))];
        });
      } catch (error) {
        console.error('Error fetching commits:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchCommits();
  }, []);

  return { commits, fetching };
}

