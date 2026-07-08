# counstellations

## Fly2Success Abroad — custom domain troubleshooting

The site runs on **Render** (`fly2successabroad.onrender.com`). The custom domain `fly2successabroad.com` uses the same app, but can fail intermittently for two reasons:

### 1. DNS (most common)

Domain DNS is on **Hostinger** (`lunar.dns-parking.com`). Some networks resolve it slowly or not at all.

**Fix in Hostinger → DNS:**

| Type | Name | Value |
|------|------|-------|
| A | `@` | `216.24.57.1` (verify in Render → Settings → Custom Domains) |
| CNAME | `www` | `fly2successabroad.onrender.com` |

Also in **Render → Settings → Custom Domains**, add both:

- `fly2successabroad.com`
- `www.fly2successabroad.com`

For better reliability, move DNS to **Cloudflare** (free) and use the same records above.

**Temporary workaround:** use [https://fly2successabroad.onrender.com/admin](https://fly2successabroad.onrender.com/admin) — same data, same password.

### 2. Render free tier cold start

After ~15 minutes idle, the server sleeps. The first visit can take **30–60 seconds**; browsers may show a timeout on the custom domain.

**Fix:** ping the site every 5–10 minutes with a free monitor (e.g. UptimeRobot) on:

`https://fly2successabroad.com/health`

### Admin password

Set `ADMIN_PASSWORD` in Render → Environment. Default in code is `fly2success2026` only if the env var is not set on Render.

## SQLite backup (keep last 7)

Run from project root:

`python3 web_site/scripts/backup_sqlite.py`

Optional flags:

- `--keep 7` number of recent backups to retain
- `--db web_site/data/leads.db` custom database path
- `--out-dir web_site/backups` custom backup directory
