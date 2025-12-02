import { useState, useEffect } from 'react';
import './App.css';

interface Repo {
  id: number;
  name: string;
}

function App() {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    const fetchRepos = async () => {
      const baseUrl = 'https://api.github.com/users/aidencullo/repos';
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
        setRepos((prev) => {
          const ids = new Set(prev.map(r => r.id));
          return [...prev, ...data.filter((r: Repo) => !ids.has(r.id))];
        });
        if (data.length === 0) {
          break;
        }
        page++;
        urlParams = new URLSearchParams({ per_page: '100', page: page.toString() });
        url = `${baseUrl}?${urlParams.toString()}`;
      }
    };
    fetchRepos();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>My GitHub Repositories</h1>
        {repos.length > 0 ? (
          <p>{repos.length}</p>
        ) : (
          <p>Loading repositories...</p>
        )}
      </header>
    </div>
  );
}

export default App;

