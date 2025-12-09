import {
  GITHUB_EVENTS_BASE_URL,
  GITHUB_EVENTS_PER_PAGE,
  GITHUB_USERNAME,
} from '../constants/github';

export function buildUserEventsUrl(
  username: string = GITHUB_USERNAME,
  perPage: number = GITHUB_EVENTS_PER_PAGE,
) {
  const params = new URLSearchParams({
    per_page: perPage.toString(),
  });
  return `${GITHUB_EVENTS_BASE_URL}/${username}/events?${params.toString()}`;
}

export function buildGitHubHeaders(): HeadersInit {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) {
    return {};
  }

  return {
    Authorization: `token ${token}`,
  };
}

export async function fetchGitHubJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...buildGitHubHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

