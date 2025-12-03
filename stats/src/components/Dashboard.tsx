import '../App.css';
import { useRepos } from '../hooks/useRepos';

function Dashboard() {
  const { repos, fetching } = useRepos();

  return (
    <div className="App">
      <header className="App-header">
        <h1>aidencullo's GitHub Repositories</h1>
        {!fetching ? (
          <p>{repos.length}</p>
        ) : (
          <p>Loading repositories...</p>
        )}
      </header>
    </div>
  );
}

export default Dashboard;

