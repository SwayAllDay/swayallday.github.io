# Website analytics (www.zoyasmusic.com)

The same setup as the links page (SwayAllDay/Link), for the main website.

| File | What it does |
| --- | --- |
| `/analytics.js` | Runs on every page. Reports visits and clicks to `/api/track`. No cookies, no names or emails. |
| `/stats.html` | The password-protected dashboard: open www.zoyasmusic.com/stats.html |
| `_analytics-worker/src/worker.js` | The backend: `/api/track` writes events to Cloudflare Analytics Engine, `/api/stats` reads them back |

GitHub Pages leaves this `_analytics-worker` folder off the public site (folders starting with `_` aren't published).

## What gets counted

Page views (with country, phone or desktop, the website people came from, and `utm_source` of campaign links),
releases opened in the homepage carousel, "Listen on" clicks per platform, social icon clicks,
free-download signups and preview plays, menu and button clicks, and links to other websites.

## One-time setup in Cloudflare

1. **Workers & Pages → Create → Import a repository** → choose `SwayAllDay/swayallday.github.io`.
   - Root directory: `_analytics-worker`
   - Build command: leave empty. Deploy command: `npx wrangler deploy`
2. After the first deploy, open the Worker → **Settings → Variables and Secrets** and add two **Secrets**:
   - `STATS_PASSWORD`: the password for the dashboard
   - `CF_ANALYTICS_TOKEN`: the same API token the links page uses (Account Analytics: Read)
3. Visit the website once, wait a few minutes, then open www.zoyasmusic.com/stats.html.

The Worker only answers `www.zoyasmusic.com/api/*`; every other page is still served by GitHub Pages.
After setup, every push to `main` redeploys it automatically.
