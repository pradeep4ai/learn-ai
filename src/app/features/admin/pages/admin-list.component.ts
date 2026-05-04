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
    <div class="container admin-page">
      <header class="page-head">
        <span class="eyebrow">Admin</span>
        <h1>Your drafts</h1>
        <p class="muted">Posts saved in this browser. They are not visible to other visitors.</p>
        <div class="actions">
          <a routerLink="/admin/new" class="btn btn-primary">+ New post</a>
        </div>
      </header>

      <section class="security-note">
        <strong>How storage works:</strong>
        drafts live in this browser's local storage only. To publish to the public site,
        click <em>Export .md</em> on a draft and commit the file to <code>content/posts/</code>.
      </section>

      <ng-container *ngIf="drafts().length > 0; else empty">
        <ul>
          <li *ngFor="let d of drafts()">
            <article class="card">
              <span class="card-bar"></span>
              <div class="row">
                <div>
                  <h2>{{ d.title || '(untitled)' }}</h2>
                  <p class="meta">
                    {{ d.date | date:'mediumDate' }} ·
                    <span class="slug">{{ d.slug }}</span>
                    <span class="badge" [class.draft]="d.draft">{{ d.draft ? 'Draft' : 'Ready' }}</span>
                  </p>
                </div>
              </div>
              <p class="desc" *ngIf="d.description">{{ d.description }}</p>
              <div class="tags" *ngIf="d.tags.length > 0">
                <span class="tag" *ngFor="let t of d.tags">#{{ t }}</span>
              </div>
              <div class="row btns">
                <a [routerLink]="['/admin/edit', d.slug]" class="btn btn-ghost">Edit</a>
                <button type="button" class="btn btn-ghost" (click)="export(d.slug)">Export .md</button>
                <button type="button" class="btn btn-danger" (click)="remove(d.slug)">Delete</button>
              </div>
            </article>
          </li>
        </ul>
      </ng-container>
      <ng-template #empty>
        <p class="empty">No drafts yet. <a routerLink="/admin/new">Write your first one</a>.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .admin-page { padding: 3rem 0; }
    .page-head { margin-bottom: 1.5rem; }
    .eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--fg-muted);
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 2.25rem; margin: 0 0 0.4rem; }
    .muted { color: var(--fg-muted); margin: 0 0 1rem; }
    .actions { display: flex; gap: 0.6rem; }
    .security-note {
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius);
      padding: 0.85rem 1rem;
      color: var(--fg-muted);
      font-size: 0.92rem;
      margin-bottom: 2rem;
    }
    .security-note strong { color: var(--fg); }
    code { background: var(--code-bg); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 1rem; }
    .card {
      position: relative;
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .card-bar { position: absolute; inset: 0 auto 0 0; width: 4px; background: linear-gradient(180deg, var(--accent), var(--accent-2)); }
    .row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
    h2 { margin: 0 0 0.3rem; font-size: 1.15rem; }
    .meta { color: var(--fg-muted); font-size: 0.85rem; margin: 0; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .slug { font-family: var(--font-mono); }
    .badge {
      font-size: 0.7rem;
      padding: 0.1rem 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .badge.draft { background: color-mix(in srgb, var(--accent-warm) 16%, transparent); color: var(--accent-warm); }
    .desc { color: var(--fg-muted); margin: 0.6rem 0; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.85rem; }
    .tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
      font-weight: 500;
    }
    .btns { gap: 0.5rem; justify-content: flex-start; margin-top: 0.5rem; }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.45rem 0.95rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      border: 0;
      cursor: pointer;
      transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: var(--shadow-md); }
    .btn-primary:hover { transform: translateY(-1px); background: var(--accent-strong); }
    .btn-ghost { color: var(--fg); border: 1px solid var(--border); background: transparent; }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .btn-danger { color: #fff; background: #d23f3f; }
    .btn-danger:hover { background: #b53030; }
    .empty { color: var(--fg-muted); }
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
