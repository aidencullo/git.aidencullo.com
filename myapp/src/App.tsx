import { useState, useEffect } from 'react';
import './App.css';

interface Repo {
  id: number;
  name: string;
}

function App() {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    fetch('https://api.github.com/users/aidencullo/repos')
      .then((response) => response.json())
      .then((data) => setRepos(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>My GitHub Repositories</h1>
        {repos.length > 0 ? (
          <ul>
            {repos.map((repo) => (
              <li key={repo.id}>{repo.name}</li>
            ))}
          </ul>
        ) : (
          <p>Loading repositories...</p>
        )}
      </header>
    </div>
  );
}

export default App;

