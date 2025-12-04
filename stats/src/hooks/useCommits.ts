import { useState, useEffect } from 'react';

interface Event {
  created_at: string;
}

const TIME_ZONE = 'America/New_York';
const toDateString = (date: Date) =>
  date.toLocaleDateString('en-US', { timeZone: TIME_ZONE });

export function useCommits() {
  const [commitsToday, setCommitsToday] = useState(0);
  const [commitsYesterday, setCommitsYesterday] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const url = `https://api.github.com/users/aidencullo/events`;
      try {
        setFetching(true);
        const response = await fetch(url, {
          headers: {
            Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub events request failed: ${response.status}`);
        }

        const data: Event[] = await response.json();

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
      } catch (error) {
        console.error('Error fetching commits:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchEvents();
  }, []);

  return { commitsToday, commitsYesterday, fetching };
}

