import { useState, useEffect } from 'react';

interface Event {
  created_at: string;
}

export function useCommits() {
  const [commits, setCommits] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [dates, setDates] = useState<string[]>([]);


  useEffect(() => {
    const fetchEvents = async () => {
        const url = `https://api.github.com/users/aidencullo/events`
        try {
          setFetching(true);
          const response = await fetch(url, {
            headers: {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            },
          });
          const data = await response.json();
          console.log(data)
          setCommits(data.length);
          setDates(data.map((e: Event) => {
            const date = new Date(e.created_at);
            return date.toLocaleString('en-US', { timeZone: 'America/New_York' });
          }));
        } catch (error) {
          console.error('Error fetching commits:', error);
        } finally {
          setFetching(false);
        }
      }
    fetchEvents();
  }, []);

  return { commits, fetching, dates };
}

