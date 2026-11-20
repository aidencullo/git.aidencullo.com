import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DAYS, fetchContributions } from '../../shared/contributions.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/contributions.json');

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.warn('GITHUB_TOKEN is not set; writing empty GitHub contribution data.');
}

const payload = await fetchContributions({ githubToken: token });

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${DAYS} days of contribution data to ${outputPath}`);
