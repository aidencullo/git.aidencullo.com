export const USERNAME = 'aidencullo';
export const DAYS = 30;

export const CONTRIBUTIONS_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

export function lastNDates(n = DAYS, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (n - 1 - i)));
    return d.toISOString().slice(0, 10);
  });
}

export async function fetchContributions({ githubToken, fetchImpl = fetch }) {
  const dates = lastNDates(DAYS);
  const from = `${dates[0]}T00:00:00Z`;
  const to = new Date().toISOString();
  const githubCounts = new Map(dates.map(date => [date, 0]));

  if (githubToken) {
    const res = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'git.aidencullo.com-dashboard',
      },
      body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: USERNAME, from, to } }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 500);
      throw new Error(`GitHub API returned ${res.status}: ${detail}`);
    }

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);

    const days = json.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
      week => week.contributionDays
    );
    for (const day of days) {
      if (githubCounts.has(day.date)) githubCounts.set(day.date, day.contributionCount);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    github: Object.fromEntries(dates.map(date => [date, githubCounts.get(date)])),
  };
}
