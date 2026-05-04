import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '@core/services/post.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf, RouterLink],
  template: `
    <div class="container blog-page">
      <header class="page-head">
        <span class="eyebrow">Archive</span>
        <h1>Blog</h1>
        <p class="muted">All posts, newest first.</p>
      </header>
      <ng-container *ngIf="posts$ | async as posts; else loading">
        <ul *ngIf="posts.length > 0; else empty">
          <li *ngFor="let p of posts">
            <a [routerLink]="['/blog', p.slug]" class="card">
              <span class="card-bar"></span>
              <span class="badge" *ngIf="p.source === 'local'">Local draft</span>
              <h2>{{ p.title }}</h2>
              <p class="meta">{{ p.date | date:'mediumDate' }}</p>
              <p class="desc">{{ p.description }}</p>
              <div class="tags">
                <span class="tag" *ngFor="let t of p.tags">#{{ t }}</span>
              </div>
            </a>
          </li>
        </ul>
        <ng-template #empty><p class="empty">No posts yet.</p></ng-template>
      </ng-container>
      <ng-template #loading><p>Loading…</p></ng-template>
    </div>
  `,
  styles: [`
    .blog-page { padding: 3rem 0; }
    .page-head { margin-bottom: 2.5rem; }
    .eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--fg-muted);
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 2.5rem; margin: 0 0 0.5rem; }
    .muted { color: var(--fg-muted); margin: 0; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
    .card {
      display: block;
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      text-decoration: none;
      color: var(--fg);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
    }
    .card-bar { position: absolute; inset: 0 auto 0 0; width: 4px; background: linear-gradient(180deg, var(--accent), var(--accent-2)); }
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
    h2 { margin: 0 0 0.3rem; font-size: 1.15rem; padding-right: 5rem; }
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
export class BlogListComponent {
  private readonly service = inject(PostService);
  readonly posts$ = this.service.list();
}
