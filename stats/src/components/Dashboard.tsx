import '../App.css';
import { useCommits, type SourceStats } from '../hooks/useCommits';

function RobotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 7V4M9 4h6" />
      <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M9 16h6" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

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
      <header className="profile-card">
        <div className="avatar"><RobotIcon /></div>
        <div className="profile-info">
          <span className="field-label">Identity</span>
          <h1>Aiden</h1>
          <div className="handle-row">
            <GithubIcon />
            <span className="field-label">GitHub username</span>
            <a
              className="username"
              href="https://github.com/aidencullo"
              target="_blank"
              rel="noreferrer"
            >
              aidencullo <span aria-hidden="true">↗</span>
            </a>
          </div>
          {dateLabel && (
            <p className="date"><CalendarIcon /> {dateLabel}</p>
          )}
        </div>
        <span className="live-badge"><span className="live-dot" /> Live</span>
      </header>
      <SourceChart title="GitHub" stats={github} />
    </div>
  );
}
