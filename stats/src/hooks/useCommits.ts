import { useState, useEffect } from 'react';

interface GithubEvent {
  created_at: string;
}

interface GitlabEvent {
  created_at: string;
  push_data?: {
    commit_count?: number;
  };
}

const GITHUB_EVENTS_URL = 'https://api.github.com/users/aidencullo/events';
const GITLAB_USERS_URL = 'https://gitlab.com/api/v4/users';
const GITLAB_EVENTS_URL = (id: number) =>
  `https://gitlab.com/api/v4/users/${id}/events?action=pushed`;

const TIME_ZONE = 'America/New_York';
const toDateString = (date: Date) =>
  date.toLocaleDateString('en-US', { timeZone: TIME_ZONE });

export function useCommits() {
  const [commitsToday, setCommitsToday] = useState(0);
  const [commitsYesterday, setCommitsYesterday] = useState(0);
  const [gitlabCommitsToday, setGitlabCommitsToday] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchGithubCommits = async () => {
      const response = await fetch(GITHUB_EVENTS_URL, {
        headers: {
          Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub events request failed: ${response.status}`);
      }

      const data: GithubEvent[] = await response.json();

      const now = new Date();
      const todayString = toDateString(now);
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(now.getDate() - 1);
      const yesterdayString = toDateString(yesterdayDate);

      let todaysCommits = 0;
      let yesterdaysCommits = 0;

      data.forEach((event) => {
        const eventDate = toDateString(new Date(event.created_at));
        if (eventDate === todayString) {
          todaysCommits += 1;
        } else if (eventDate === yesterdayString) {
          yesterdaysCommits += 1;
        }
      });

      setCommitsToday(todaysCommits);
      setCommitsYesterday(yesterdaysCommits);
    };

    const fetchGitlabCommits = async () => {
      const username = import.meta.env.VITE_GITLAB_USERNAME ?? 'aidencullo';
      const gitlabHeaders: HeadersInit = {};
      const gitlabToken = import.meta.env.VITE_GITLAB_TOKEN;

      if (gitlabToken) {
        gitlabHeaders.Authorization = `Bearer ${gitlabToken}`;
      }

      const userResponse = await fetch(`${GITLAB_USERS_URL}?username=${username}`, {
        headers: gitlabHeaders,
      });

      if (!userResponse.ok) {
        throw new Error(`GitLab user lookup failed: ${userResponse.status}`);
      }

      const [user] = await userResponse.json();

      if (!user) {
        throw new Error(`GitLab user ${username} not found`);
      }

      const eventsResponse = await fetch(GITLAB_EVENTS_URL(user.id), {
        headers: gitlabHeaders,
      });

      if (!eventsResponse.ok) {
        throw new Error(`GitLab events request failed: ${eventsResponse.status}`);
      }

      const events: GitlabEvent[] = await eventsResponse.json();
      const todayString = toDateString(new Date());

      let todaysCommits = 0;

      events.forEach((event) => {
        const eventDate = toDateString(new Date(event.created_at));
        if (eventDate === todayString) {
          todaysCommits += event.push_data?.commit_count ?? 0;
        }
      });

      setGitlabCommitsToday(todaysCommits);
    };

    const fetchAllCommits = async () => {
      setFetching(true);
      try {
        await Promise.all([fetchGithubCommits(), fetchGitlabCommits()]);
      } catch (error) {
        console.error('Error fetching commits:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchAllCommits();
  }, []);

  return { commitsToday, commitsYesterday, gitlabCommitsToday, fetching };
}

