import { GITLAB_API_BASE_URL, GITLAB_PER_PAGE } from '../constants/gitlab';

function getGitLabBaseUrl() {
  return (import.meta.env.VITE_GITLAB_BASE_URL as string | undefined) ?? GITLAB_API_BASE_URL;
}

export function buildGitLabHeaders(): HeadersInit {
  const token = import.meta.env.VITE_GITLAB_TOKEN as string | undefined;
  if (!token) {
    return {};
  }

  return {
    'PRIVATE-TOKEN': token,
  };
}

export async function fetchGitLabJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...buildGitLabHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitLab request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getGitLabProjectIds(): string[] {
  const raw =
    (import.meta.env.VITE_GITLAB_PROJECT_IDS as string | undefined) ??
    (import.meta.env.VITE_GITLAB_PROJECTS as string | undefined) ??
    '';

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildProjectCommitsUrl(projectId: string, since?: Date, perPage = GITLAB_PER_PAGE) {
  const baseUrl = getGitLabBaseUrl();
  const params = new URLSearchParams({
    per_page: perPage.toString(),
  });

  if (since) {
    params.set('since', since.toISOString());
  }

  // projectId can be numeric ("123") or a path ("group/project").
  const encoded = encodeURIComponent(projectId);
  return `${baseUrl}/projects/${encoded}/repository/commits?${params.toString()}`;
}

