import '../App.css';
import CommitsStats from './CommitsStats';

function Dashboard() {
  return (
    <main className="terminal-shell" aria-label="Git stats terminal">
      <p className="terminal-line terminal-line--brand">aidencullo@stats:~$ ./commit-report</p>
      <CommitsStats />
    </main>
  );
}

export default Dashboard;
