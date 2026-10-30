// Cloudflare Worker for www.zoyasmusic.com/api/*  (the rest of the site stays on GitHub Pages)
//   POST /api/track  -> records one visit/click event to Analytics Engine
//   GET  /api/stats  -> password-protected: reads the aggregated numbers back for /stats.html
//
// Built the same way as the links.zoyasmusic.com page (SwayAllDay/Link).
// Analytics Engine stores raw events (no cookies, no IP addresses) and rolls them
// up server-side. The visitor's country comes from Cloudflare's own request data,
// not from a geo-IP lookup.

const DATASET = "zoya_site";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const method = request.method;

    if (method === "POST" && pathname === "/api/track") return track(request, env);
    if (method === "GET" && pathname === "/api/stats") return stats(request, env);

    return json({ error: "Not found" }, 404);
  },
};

/* ---------- helpers ---------- */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const clip = (s = "", n) => String(s).slice(0, n);

function safeHost(url = "") {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// "/", "/index.html" and "" all count as the homepage.
function cleanPath(path = "") {
  const p = clip(path, 80).split("?")[0].split("#")[0];
  return !p || p === "/index.html" ? "/" : p;
}

/* ---------- tracking ---------- */

// What the page is allowed to report. Anything else is dropped rather than trusted blindly.
const EVENT_TYPES = new Set([
  "pageview",       // label = utm_source of the visit, if any
  "social",         // target = platform (Instagram, Spotify, ...)
  "release_open",   // target = release title (homepage carousel)
  "listen_click",   // target = release title, label = platform
  "signup_submit",  // free download signup sent (no name or email is stored)
  "preview_play",   // demo preview player started
  "spotify_reveal", // "listen on Spotify" button in the download step
  "nav_click",      // target = menu item
  "cta_click",      // target = button text
  "email_click",    // a mailto: link
  "outbound",       // target = website the visitor went to
]);

async function track(request, env) {
  if (!env.ANALYTICS) return json({ error: "Analytics is not set up yet." }, 501);

  // Only count events sent from the website itself.
  const origin = request.headers.get("Origin") || "";
  if (origin && !/^https:\/\/(www\.)?zoyasmusic\.com$/.test(origin)) return json({ error: "forbidden" }, 403);

  const body = await request.json().catch(() => null);
  const type = body && EVENT_TYPES.has(body.type) ? body.type : null;
  if (!type) return json({ error: "unknown event type" }, 400);

  const country = request.cf && request.cf.country ? request.cf.country : "XX";
  const referrerHost = safeHost(body.referrer);
  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(request.headers.get("User-Agent") || "") ? "mobile" : "desktop";

  env.ANALYTICS.writeDataPoint({
    blobs: [type, clip(body.target, 80), clip(body.label, 80), country, referrerHost, device, cleanPath(body.path)],
    doubles: [1],
    indexes: [type], // one event type per request keeps sampling accurate within each type
  });

  return json({ ok: true });
}

/* ---------- stats dashboard ---------- */

// Simple shared-password gate: fine for checking your own numbers,
// not meant to withstand a determined attacker.
function authorized(request, env) {
  if (!env.STATS_PASSWORD) return false;
  const key = request.headers.get("X-Stats-Key") || "";
  return key.length > 0 && key === env.STATS_PASSWORD;
}

async function stats(request, env) {
  if (!authorized(request, env)) return json({ error: "Wrong or missing password." }, 401);
  if (!env.CF_ACCOUNT_ID || !env.CF_ANALYTICS_TOKEN) {
    return json({ error: "CF_ACCOUNT_ID or CF_ANALYTICS_TOKEN is not set on the Worker." }, 501);
  }

  const days = Math.min(90, Math.max(1, Number(new URL(request.url).searchParams.get("days")) || 30));
  const since = `timestamp > now() - INTERVAL '${days}' DAY`;
  const sql = (q) => queryAnalyticsEngine(env, q);
  const top = (column, where, limit = 10) =>
    sql(`SELECT ${column} AS name, SUM(_sample_interval) AS count FROM ${DATASET}
         WHERE ${where} AND ${since} GROUP BY name ORDER BY count DESC LIMIT ${limit}`);

  try {
    const [totals, daily, pages, countries, devices, referrers, campaigns, releases, platforms, socials, outbound] =
      await Promise.all([
        sql(`SELECT blob1 AS type, SUM(_sample_interval) AS count FROM ${DATASET} WHERE ${since} GROUP BY type`),
        sql(`SELECT toDate(timestamp) AS day, SUM(_sample_interval) AS count FROM ${DATASET}
             WHERE blob1 = 'pageview' AND ${since} GROUP BY day ORDER BY day`),
        top("blob7", "blob1 = 'pageview'"),
        top("blob4", "blob1 = 'pageview'"),
        top("blob6", "blob1 = 'pageview'"),
        top("blob5", "blob1 = 'pageview' AND blob5 != '' AND blob5 NOT LIKE '%zoyasmusic.com'"),
        top("blob3", "blob1 = 'pageview' AND blob3 != ''"),
        top("blob2", "blob1 = 'release_open'"),
        top("blob3", "blob1 = 'listen_click'"),
        top("blob2", "blob1 = 'social'"),
        top("blob2", "blob1 = 'outbound'"),
      ]);

    const counts = Object.fromEntries(totals.map((r) => [r.type, Number(r.count) || 0]));

    return json({
      days,
      pageviews: counts.pageview || 0,
      clicks: totals.reduce((sum, r) => (r.type === "pageview" ? sum : sum + Number(r.count)), 0),
      signups: counts.signup_submit || 0,
      previewPlays: counts.preview_play || 0,
      daily,
      pages,
      countries,
      devices,
      referrers,
      campaigns,
      releases,
      platforms,
      socials,
      outbound,
    });
  } catch (err) {
    return json({ error: String(err && err.message ? err.message : err) }, 502);
  }
}

async function queryAnalyticsEngine(env, sql) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, "Content-Type": "text/plain" },
    body: sql,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw new Error((body && (body.error || body.errors)) || `Analytics query failed (${res.status})`);
  return body.data || [];
}
