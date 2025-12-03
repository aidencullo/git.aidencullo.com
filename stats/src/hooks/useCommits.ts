import { useState, useEffect } from 'react';

export function useCommits() {
  const [commits, setCommits] = useState(0);
  const [fetching, setFetching] = useState(false);


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
        } catch (error) {
          console.error('Error fetching commits:', error);
        } finally {
          setFetching(false);
        }
      }
    fetchEvents();
  }, []);

  return { commits, fetching };
}

