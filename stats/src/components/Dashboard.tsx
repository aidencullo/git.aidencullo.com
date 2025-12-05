import '../App.css';
import { useRepos } from '../hooks/useRepos';
import RepoStats from './RepoStats';
import CommitsStats from './CommitsStats';

function Dashboard() {
  const { repos } = useRepos();

  return (
    <div className="App">
      <header className="App-header">
        <h1>aidencullo</h1>
        <RepoStats reposCount={repos.length} />
        <CommitsStats />
      </header>
    </div>
  );
}

export default Dashboard;

