# Live contributions API

Cloudflare Worker that returns the same `{ generatedAt, github }` payload as
`stats/public/contributions.json`, but fetches fresh GitHub data on every request.
The dashboard at git.aidencullo.com calls this instead of the static snapshot.

## Deploy

Deploy from this directory:

```bash
cd worker
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

`GITHUB_TOKEN` can be a fine-grained PAT with read access to public profile data,
or an existing OAuth token. It never reaches the browser.

Set the deployed URL as `VITE_CONTRIBUTIONS_API_URL` on the GitHub repo so the
Pages build picks it up:

```bash
gh variable set VITE_CONTRIBUTIONS_API_URL \
  -R aidencullo/git.aidencullo.com \
  --body 'https://<worker>.<account>.workers.dev/contributions'
```

The Pages workflow (`schedule` + static JSON) remains as a fallback snapshot.
