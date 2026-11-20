import { fetchContributions } from '../shared/contributions.mjs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://git.aidencullo.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (new URL(request.url).pathname !== '/contributions') {
      return json({ error: 'Not found' }, 404);
    }

    try {
      const data = await fetchContributions({ githubToken: env.GITHUB_TOKEN });
      return json(data);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
      return json({ error: String(err) }, 502);
    }
  },
};
