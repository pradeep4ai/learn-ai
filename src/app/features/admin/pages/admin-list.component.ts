import { Component, computed, inject } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DraftService } from '@core/services/draft.service';
import { downloadMarkdown } from '@core/utils/markdown-export.util';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, RouterLink],
  template: `
    <div class="admin-page">
      <header class="page-head">
        <div>
          <span class="eyebrow">Admin</span>
          <h1>Drafts</h1>
        </div>
        <a routerLink="/admin/new" class="btn btn-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New post
        </a>
      </header>

      <ng-container *ngIf="drafts().length > 0; else empty">
        <ul class="list">
          <li *ngFor="let d of drafts()">
            <article class="card">
              <div class="card-main">
                <h2>{{ d.title || '(untitled)' }}</h2>
                <p class="meta">
                  <span>{{ d.date | date:'mediumDate' }}</span>
                  <span class="dot" aria-hidden="true">·</span>
                  <code class="slug">{{ d.slug }}</code>
                  <span class="badge" [class.is-draft]="d.draft">{{ d.draft ? 'Draft' : 'Ready' }}</span>
                </p>
                <p class="desc" *ngIf="d.description">{{ d.description }}</p>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/admin/edit', d.slug]" class="icon-btn" title="Edit" aria-label="Edit">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                </a>
                <button type="button" class="icon-btn" (click)="export(d.slug)" title="Export .md" aria-label="Export">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
                <button type="button" class="icon-btn danger" (click)="remove(d.slug)" title="Delete" aria-label="Delete">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </article>
          </li>
        </ul>
      </ng-container>

      <ng-template #empty>
        <div class="empty-state">
          <div class="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          </div>
          <h2>No drafts yet</h2>
          <p>Write a post — it'll save in this browser.</p>
          <a routerLink="/admin/new" class="btn btn-primary">Start writing</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .admin-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem 4rem;
    }
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--fg-muted);
      margin-bottom: 0.4rem;
    }
    h1 { font-size: 2rem; margin: 0; letter-spacing: -0.02em; }

    .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }

    .card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.1rem 1.25rem;
      transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }
    .card:hover { border-color: var(--accent); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
    .card-main { flex: 1; min-width: 0; }
    h2 {
      margin: 0 0 0.4rem;
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      color: var(--fg-muted);
      font-size: 0.8rem;
      margin: 0;
    }
    .dot { opacity: 0.5; }
    .slug { font-family: var(--font-mono); font-size: 0.78rem; padding: 0.1rem 0.4rem; background: var(--code-bg); border-radius: 4px; }
    .badge {
      font-size: 0.65rem;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      color: var(--accent);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .badge.is-draft { background: color-mix(in srgb, var(--accent-warm) 16%, transparent); color: var(--accent-warm); }
    .desc {
      margin: 0.6rem 0 0;
      color: var(--fg-muted);
      font-size: 0.88rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      color: var(--fg-muted);
      cursor: pointer;
      text-decoration: none;
      transition: all 120ms ease;
    }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--bg)); }
    .icon-btn.danger:hover { border-color: #d23f3f; color: #d23f3f; background: color-mix(in srgb, #d23f3f 8%, var(--bg)); }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.88rem;
      border: 0;
      cursor: pointer;
      transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
    }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: var(--shadow-sm); }
    .btn-primary:hover { background: var(--accent-strong); transform: translateY(-1px); box-shadow: var(--shadow-md); }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-elev);
      border: 1px dashed var(--border);
      border-radius: var(--radius-lg);
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      margin: 0 auto 1.25rem;
      border-radius: 16px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
    }
    .empty-state h2 { font-size: 1.25rem; margin: 0 0 0.4rem; }
    .empty-state p { color: var(--fg-muted); margin: 0 0 1.5rem; }

    @media (max-width: 540px) {
      .admin-page { padding: 2rem 1rem 3rem; }
      .page-head { flex-direction: column; align-items: flex-start; }
      .card { padding: 1rem; gap: 0.75rem; }
      h1 { font-size: 1.6rem; }
    }
  `],
})
export class AdminListComponent {
  private readonly drafts$ = inject(DraftService);
  private readonly meta = inject(Meta);
  readonly drafts = computed(() => [...this.drafts$.drafts()].sort((a, b) => (a.date < b.date ? 1 : -1)));

  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  export(slug: string): void {
    const d = this.drafts$.get(slug);
    if (d) downloadMarkdown(d);
  }

  remove(slug: string): void {
    if (confirm(`Delete draft "${slug}"? This cannot be undone.`)) {
      this.drafts$.remove(slug);
    }
  }
}
