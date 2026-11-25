import '../App.css';
import { useCommits, type SourceStats } from '../hooks/useCommits';

function SourceChart({ title, stats }: { title: string; stats: SourceStats }) {
  const max = Math.max(...stats.daily.map(d => d.count), 1);

  return (
    <section className="section">
      <h2>{title}</h2>

      <div className="today-count">
        <span>{stats.today}</span> commit{stats.today !== 1 ? 's' : ''} today
      </div>

      <div className="chart">
        {stats.daily.map(({ date, count }) => (
          <div key={date} className="bar-wrap" title={`${date}: ${count}`}>
            <div
              className={[
                'bar',
                count === 0 ? 'empty' : '',
                date === stats.todayDate ? 'today' : '',
              ].join(' ')}
              style={{ height: count === 0 ? '3px' : `${(count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="stats-row">
        <div className="stat">
          <span className="stat-value">{stats.thisWeek}</span>
          <span className="stat-label">this week</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.thisMonth}</span>
          <span className="stat-label">this month</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-label">day streak</span>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { github, loading, error } = useCommits();

  if (loading) return <div className="loading">fetching commits…</div>;
  if (error) return <div className="error">{error}</div>;

  const dateLabel = github.todayDate
    ? new Date(`${github.todayDate}T00:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  return (
    <div className="container">
      <header className="profile">
        <h1>Aiden</h1>
        <p className="username">GitHub username: <strong>aidencullo</strong></p>
        {dateLabel && <p className="date">{dateLabel}</p>}
      </header>
      <SourceChart title="GitHub" stats={github} />
    </div>
  );
}
