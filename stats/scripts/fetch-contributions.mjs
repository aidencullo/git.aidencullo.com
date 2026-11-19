import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const USERNAME = 'aidencullo';
const DAYS = 30;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/contributions.json');

const QUERY = `
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

function lastNDates(n) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (n - 1 - i)));
    return d.toISOString().slice(0, 10);
  });
}

const dates = lastNDates(DAYS);
const from = `${dates[0]}T00:00:00Z`;
const to = new Date().toISOString();
const githubCounts = new Map(dates.map(date => [date, 0]));
const gitlabCounts = new Map(dates.map(date => [date, 0]));

const token = process.env.GITHUB_TOKEN;

if (token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: USERNAME, from, to } }),
  });

  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);

  const days = json.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
    week => week.contributionDays
  );
  for (const day of days) {
    if (githubCounts.has(day.date)) githubCounts.set(day.date, day.contributionCount);
  }
} else {
  console.warn('GITHUB_TOKEN is not set; writing empty contribution data.');
}

// GitLab exposes a public contribution calendar without authentication.
try {
  const res = await fetch(`https://gitlab.com/users/${USERNAME}/calendar.json`);
  if (res.ok) {
    const gitlab = await res.json();
    for (const [date, count] of Object.entries(gitlab)) {
      if (gitlabCounts.has(date)) gitlabCounts.set(date, count);
    }
  } else {
    console.warn(`GitLab calendar returned ${res.status}; skipping GitLab counts.`);
  }
} catch (err) {
  console.warn(`GitLab calendar fetch failed: ${err}; skipping GitLab counts.`);
}

const payload = {
  generatedAt: new Date().toISOString(),
  github: Object.fromEntries(dates.map(date => [date, githubCounts.get(date)])),
  gitlab: Object.fromEntries(dates.map(date => [date, gitlabCounts.get(date)])),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${dates.length} days of contribution data to ${outputPath}`);
