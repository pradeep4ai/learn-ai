import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PostService } from '@core/services/post.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-decor" aria-hidden="true">
        <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="var(--accent)" stop-opacity="0.55"/>
              <stop offset="1" stop-color="var(--accent-2)" stop-opacity="0.25"/>
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stop-color="var(--accent-3)" stop-opacity="0.45"/>
              <stop offset="1" stop-color="var(--accent-warm)" stop-opacity="0.20"/>
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r="180" fill="url(#g1)"/>
          <circle cx="680" cy="280" r="140" fill="url(#g2)"/>
          <circle cx="500" cy="80"  r="60"  fill="var(--accent-2)" fill-opacity="0.18"/>
        </svg>
      </div>

      <div class="container hero-inner">
        <span class="eyebrow">notes &middot; findings &middot; learnings</span>
        <h1>AI <span class="grad-text">Learnings</span></h1>
        <p class="lead">
          What I'm figuring out about LLMs, agents, prompting, evals, and shipping with AI —
          short, practical posts you can actually use.
        </p>
        <div class="cta">
          <a routerLink="/blog" class="btn btn-primary">Read the blog &rarr;</a>
          <a routerLink="/about" class="btn btn-ghost">About this site</a>
        </div>
      </div>
    </section>

    <section class="container topics">
      <header class="section-head">
        <h2>What you'll find here</h2>
        <p class="muted">Four lanes I keep coming back to.</p>
      </header>
      <div class="topic-grid">
        <article class="topic" style="--tone: var(--accent);">
          <div class="topic-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h3>LLMs &amp; reasoning</h3>
          <p>How models actually behave — context windows, prompting patterns, and where they break.</p>
        </article>

        <article class="topic" style="--tone: var(--accent-2);">
          <div class="topic-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 5v-2M12 21v-2M5 12H3M21 12h-2M7.05 7.05L5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41"/>
            </svg>
          </div>
          <h3>Agents &amp; tools</h3>
          <p>Tool use, planning, multi-step workflows — what works in practice and what just looks good in demos.</p>
        </article>

        <article class="topic" style="--tone: var(--accent-3);">
          <div class="topic-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3h18v18H3z"/>
              <path d="M9 9h6v6H9z"/>
              <path d="M3 9h6M3 15h6M15 9h6M15 15h6M9 3v6M15 3v6M9 15v6M15 15v6"/>
            </svg>
          </div>
          <h3>Evals &amp; quality</h3>
          <p>How to know your AI system is actually good — datasets, scoring, and the traps I've fallen into.</p>
        </article>

        <article class="topic" style="--tone: var(--accent-warm);">
          <div class="topic-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v6M12 14v8"/>
              <path d="M5 9c0-3 3-5 7-5s7 2 7 5-3 5-7 5-7-2-7-5z"/>
            </svg>
          </div>
          <h3>Postmortems</h3>
          <p>What broke, why, and what I'd do differently. The bugs you remember are the ones you write up.</p>
        </article>
      </div>
    </section>

    <section class="container latest">
      <header class="section-head">
        <h2>Latest posts</h2>
        <a routerLink="/blog" class="muted">All posts &rarr;</a>
      </header>
      <ng-container *ngIf="latest$ | async as posts; else loading">
        <ul *ngIf="posts.length > 0; else empty" class="posts">
          <li *ngFor="let p of posts">
            <a [routerLink]="['/blog', p.slug]" class="card">
              <span class="card-bar"></span>
              <span class="badge" *ngIf="p.source === 'local'">Local draft</span>
              <h3>{{ p.title }}</h3>
              <p class="meta">{{ p.date | date:'mediumDate' }}</p>
              <p class="desc">{{ p.description }}</p>
              <div class="tags">
                <span class="tag" *ngFor="let t of p.tags">#{{ t }}</span>
              </div>
            </a>
          </li>
        </ul>
        <ng-template #empty>
          <p class="empty">No posts yet — head to <a routerLink="/admin">Admin</a> to write one.</p>
        </ng-template>
      </ng-container>
      <ng-template #loading><p>Loading…</p></ng-template>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      overflow: hidden;
      isolation: isolate;
      padding: 5rem 0 4rem;
      background: var(--grad-hero), var(--bg);
    }
    .hero-decor {
      position: absolute;
      inset: 0;
      z-index: -1;
      filter: blur(40px);
      opacity: 0.7;
    }
    .hero-decor svg { width: 100%; height: 100%; }
    .hero-inner { max-width: 760px; }
    .eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--fg-muted);
      margin-bottom: 1rem;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--bg-elev);
      backdrop-filter: blur(8px);
    }
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      font-weight: 800;
      margin: 0 0 1rem;
      letter-spacing: -0.025em;
    }
    .lead {
      font-size: 1.125rem;
      color: var(--fg-muted);
      max-width: 56ch;
      margin: 0 0 2rem;
    }
    .cta { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.7rem 1.25rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }
    .btn-primary {
      background: var(--accent);
      color: white;
      box-shadow: var(--shadow-md);
    }
    .btn-primary:hover { transform: translateY(-1px); background: var(--accent-strong); color: white; box-shadow: var(--shadow-lg); }
    .btn-ghost { color: var(--fg); border: 1px solid var(--border); }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    .section-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin: 4rem 0 1.5rem;
    }
    .section-head h2 { font-size: 1.6rem; margin: 0; }
    .section-head p.muted { margin: 0; }
    .muted { color: var(--fg-muted); text-decoration: none; }
    .muted:hover { color: var(--accent); }

    .topic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .topic {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
      position: relative;
      overflow: hidden;
    }
    .topic::before {
      content: '';
      position: absolute;
      inset: 0 0 auto 0;
      height: 3px;
      background: var(--tone);
    }
    .topic:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--tone); }
    .topic-icon {
      width: 40px; height: 40px;
      display: grid; place-items: center;
      border-radius: 10px;
      background: color-mix(in srgb, var(--tone) 14%, transparent);
      color: var(--tone);
      margin-bottom: 1rem;
    }
    .topic-icon svg { width: 22px; height: 22px; }
    .topic h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
    .topic p { margin: 0; color: var(--fg-muted); font-size: 0.92rem; }

    .posts {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .card {
      display: block;
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      text-decoration: none;
      color: var(--fg);
      box-shadow: var(--shadow-sm);
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
      position: relative;
      overflow: hidden;
    }
    .card-bar {
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: linear-gradient(180deg, var(--accent), var(--accent-2));
    }
    .badge {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      font-size: 0.65rem;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent-warm) 16%, transparent);
      color: var(--accent-warm);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--accent); }
    .card h3 { margin: 0 0 0.3rem; font-size: 1.15rem; padding-right: 5rem; }
    .meta { color: var(--fg-muted); font-size: 0.85rem; margin: 0 0 0.75rem; }
    .desc { margin: 0 0 1rem; color: var(--fg-muted); }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
      font-weight: 500;
    }
    .empty { color: var(--fg-muted); }
  `],
})
export class HomeComponent {
  private readonly posts = inject(PostService);
  readonly latest$ = this.posts.list().pipe(map((all) => all.slice(0, 5)));
}
