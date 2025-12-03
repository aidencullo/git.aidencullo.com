import requests

import os

from dotenv import load_dotenv
load_dotenv()

GITHUB_TOKEN = os.getenv("VITE_GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise ValueError("GITHUB_TOKEN is not set")
OWNER = "aidencullo"
REPO = "leetcode"
PER_PAGE = 100

commits = []
page = 1

while True:
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/commits"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }
    params = {"per_page": PER_PAGE, "page": page}
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    if not data:
        break
    commits.extend(data)
    page += 1

print(f"Fetched {len(commits)} commits")
