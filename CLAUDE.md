# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Personal blog + social-content site for AI learnings and tech topics, built as a **static Angular SPA**. Designed to scale into a real product the user can extend and ship to others.

## Stack (decided)

- **Framework**: Angular (standalone components, signals, lazy-loaded routes). The user knows Angular, so we stay there.
- **No backend**: a blog needs none. Add Spring Boot later only if a real dynamic feature appears (auth, comments, search).
- **Content**: Markdown files in [content/posts/](content/posts/). A build script copies them into `src/assets/posts/` and generates `index.json` so the app can list and load them.
- **Markdown rendering**: `ngx-markdown` (with sanitization on).
- **Styling**: SCSS with CSS variables in `src/styles/_tokens.scss` for theming.
- **Hosting**: **Netlify** (recommended — handles SPA routing natively, free tier, push-to-deploy). GitHub Pages is supported as a fallback but needs the SPA 404 redirect trick.

## Scaling-friendly layout

Once scaffolded, code lives feature-first so adding a feature never touches shared folders:

```
src/app/
  core/        # singletons: services, guards, interceptors (provided once)
  shared/      # reusable components, pipes, directives
  layout/      # header, footer, app shell
  features/
    blog/      # pages/, components/, services/, models/, blog.routes.ts
    home/
    about/
  app.config.ts        # providers, router, ngx-markdown config
  app.routes.ts        # lazy-loads each feature
content/posts/         # Markdown posts (authored, not code)
content/references/    # research notes (not published)
scripts/build-posts.mjs # copies content/ → src/assets/posts/ + index.json
```

Path aliases (`@core`, `@shared`, `@features`) are configured in `tsconfig.json` so imports stay clean as the tree grows.

## Multi-Agent Workflow

Four subagents — delegate via the Agent tool, do not do their job inline.

| Agent | When to invoke |
|---|---|
| [blog-writer](.claude/agents/blog-writer.md) | Drafting/editing posts and per-platform social variants. |
| [content-reviewer](.claude/agents/content-reviewer.md) | Reviewing drafts for clarity, structure, factual accuracy. |
| [security-reviewer](.claude/agents/security-reviewer.md) | Reviewing Angular code, deps, embeds, sanitization, deploy config. |
| [deploy-builder](.claude/agents/deploy-builder.md) | `npm` scripts, Angular build, Netlify/GH Pages deploy, route checks. |

Flow: **blog-writer → content-reviewer → security-reviewer (if code touched) → deploy-builder**.

## Common Commands

After scaffolding (placeholders until then):

- `npm install` — install deps.
- `npm start` — dev server at `http://localhost:4200` (Angular CLI default).
- `npm run build` — production build to `dist/`.
- `npm run posts:build` — sync `content/posts/` → `src/assets/posts/` + index.json (runs automatically before `start` and `build`).
- `npm test` — unit tests.
- Deploy: push to `main`; Netlify auto-builds.

## Conventions

- One Markdown file per post: `YYYY-MM-DD-slug.md` with front matter (`title`, `date`, `tags`, `description`, `draft`).
- Drafts have `draft: true` and are excluded from prod builds.
- Social variants: `slug.linkedin.md`, `slug.twitter.md` next to the source post — each adapted to the platform, not copy-pasted.
- Standalone components only — no NgModules.
- Lazy-load every feature route. Never import a feature directly from another feature.
