import '../App.css';
import { useCommits } from '../hooks/useCommits';

export default function Dashboard() {
  const { daily, today, thisWeek, thisMonth, streak, loading, error } = useCommits();

  if (loading) return <div className="loading">fetching commits…</div>;
  if (error) return <div className="error">{error}</div>;

  const max = Math.max(...daily.map(d => d.count), 1);
  const todayDate = new Date().toLocaleDateString('sv-SE');

  return (
    <div className="container">
      <h1>aidencullo</h1>

      <div className="today-count">
        <span>{today}</span> commit{today !== 1 ? 's' : ''} today
      </div>

      <div className="chart">
        {daily.map(({ date, count }) => (
          <div key={date} className="bar-wrap" title={`${date}: ${count}`}>
            <div
              className={[
                'bar',
                count === 0 ? 'empty' : '',
                date === todayDate ? 'today' : '',
              ].join(' ')}
              style={{ height: count === 0 ? '3px' : `${(count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{thisWeek}</span>
          <span className="stat-label">this week</span>
        </div>
        <div className="stat">
          <span className="stat-value">{thisMonth}</span>
          <span className="stat-label">this month</span>
        </div>
        <div className="stat">
          <span className="stat-value">{streak}</span>
          <span className="stat-label">day streak</span>
        </div>
      </div>
    </div>
  );
}
