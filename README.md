# AI Learnings

A static, single-page notebook for AI learnings and findings.

## Develop

```bash
npm install
npm start          # http://localhost:4200
```

`npm start` runs `posts:build` first, which copies `content/posts/*.md` into `src/assets/posts/` and writes `index.json`.

## Authoring posts

Two ways:

1. **Write Markdown by hand** — drop a file in `content/posts/` named `YYYY-MM-DD-slug.md` with front matter (`title`, `date`, `tags`, `description`, `draft`).
2. **Use the in-browser editor** — open `/admin`, write the post, hit *Export .md*, drop the downloaded file into `content/posts/`, commit.

The `/admin` page stores drafts in your browser's `localStorage` only. Other visitors of the deployed site **cannot** see them — each browser is isolated. To publish a draft to the public site, export it as `.md` and commit it.

## Deploy

### Netlify (recommended)
Push to `main`. Netlify uses [`netlify.toml`](netlify.toml) — SPA fallback + security headers (CSP, HSTS, etc.) are pre-configured.

### GitHub Pages
The workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys on every push to `main`.

One-time setup:
1. In your repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`.

The workflow auto-detects the right `--base-href`:
- If a `CNAME` file exists in the repo root → custom domain → `/`.
- Otherwise → `/<repo-name>/` (project pages).

It also copies `index.html` to `404.html` (so deep links survive a refresh) and adds `.nojekyll`.

## Security model

- No backend, no database. The deployed site is a static bundle.
- `/admin` drafts are per-browser `localStorage` — cannot be read by anyone else.
- Markdown is rendered with `ngx-markdown` and explicit `SecurityContext.HTML` sanitization (script tags / event handlers stripped).
- CSP is set both via HTTP headers (Netlify) and a `<meta http-equiv>` tag (GitHub Pages, since GH Pages can't set headers).
- `/admin` pages set `<meta name="robots" content="noindex,nofollow">`.
- `npm audit --audit-level=moderate` available via `npm run audit:ci`.
