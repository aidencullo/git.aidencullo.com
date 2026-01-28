import {
  GITHUB_EVENTS_BASE_URL,
  GITHUB_EVENTS_PER_PAGE,
  GITHUB_USERNAME,
} from '../constants/github';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

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
    Authorization: `bearer ${token}`,
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

export async function fetchGitHubGraphQL<T>(query: string): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      ...buildGitHubHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
  }

  return json.data as T;
}

