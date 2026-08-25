# mention-finder

Finds recent Reddit, Shopify Community, Webflow, and WordPress forum threads that already rank in Google's Top 5–10 for target topics, are fresh (3–45 days old), and have low comment counts — ideal opportunities for high-intent brand mentions and organic traffic.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure .env
cp .env.example .env

# 3. Run pipeline once
npm run run:once

# Or run as a daily scheduled daemon (cron)
npm start
```

---

## 🔬 How It Works

```
Track A (Poll Subreddits/Forums) ──┐
                                  ├──> Dedupe ──> Verify Rank ──> Enrich Metadata ──> Filter & Score ──> CSV/JSON Report
Track B (Keywords + Autocomplete) ─┘
```

1. **Track A (Community Ingestion):** Polls newest posts from allowlisted subreddits and forum feeds.
2. **Track B (SERP Expansion):** Expands seed topics using Google Autocomplete, queries Google via Serper.dev, and harvests new *People Also Ask* queries for future runs.
3. **Verification & Enrichment:** Checks Google rank for Track A posts, then fetches comment count and thread age.
4. **Filtering & Scoring:** Discards off-topic subreddits, old threads (>45d), or saturated posts (>30 comments), then ranks opportunities by:

$$\text{matchScore} = (6 - \text{position}) \times 2 + \frac{30 - \text{comments}}{10}$$

---

## ⚙️ Configuration

### Environment Variables (`.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SERPER_API_KEY` | *(required)* | Google Search API key from [serper.dev](https://serper.dev) |
| `REDDIT_SCRAPER_SERVICE_URL` | `http://localhost:4100` | URL for sibling `reddit-scraper-service` |
| `SERP_DAILY_BUDGET` | `400` | Maximum daily Google searches |
| `EXPANSION_DEPTH` | `2` | Google Autocomplete expansion depth |
| `MAX_KEYWORDS_PER_DAY` | `500` | Max keywords searched per daily run |
| `CACHE_TTL_HOURS` | `24` | Raw SERP response cache duration |
| `MIN_POSITION` | `10` | Only keep threads ranking $\le$ this Google position |
| `MIN_AGE_DAYS` / `MAX_AGE_DAYS` | `3` / `45` | Post age window in days |
| `MAX_COMMENTS` | `30` | Maximum comments allowed on thread |
| `CRON_SCHEDULE` | `0 6 * * *` | Schedule for `npm start` (default: daily 6:00 AM) |

### Configuration Files (`config/`)

- [`config/topics.json`](config/topics.json) — Core seed topics for Track B expansion
- [`config/subreddits.json`](config/subreddits.json) — Subreddit allowlist for Track A monitoring & Track B filtering
- [`config/forums.json`](config/forums.json) — Discourse categories & bbPress RSS feeds
- [`config/domains.json`](config/domains.json) — Allowed domain filter (`reddit.com`, `community.shopify.com`, etc.)
- [`config/verticals.json`](config/verticals.json) — Industries for optional LLM brainstorming

---

## 📂 Output & Storage

All local state is stored in `data/` (no database required):

- `data/output/YYYY-MM-DD.csv` — Daily ranked opportunities (Excel/Sheets ready)
- `data/output/YYYY-MM-DD.json` — Full structured payload
- `data/seen.json` — Processed URL tracker (prevents duplicate alerts)
- `data/discovered_keywords.json` — Auto-growing keyword pool from PAA/related queries
- `data/cache/` — 24h disk cache for SERP responses to protect API budget

---

## 🤝 Sibling Microservices

- **`reddit-scraper-service`**: Standalone proxy scraper for Reddit data (`../reddit-scraper-service`). If offline, Track A Reddit polling gracefully skips while Track B Google SERP discovery continues.
