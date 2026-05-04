import { Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { Observable, of } from 'rxjs';
import { PostService } from '@core/services/post.service';
import { PostListItem } from '@core/models/draft';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf, RouterLink, MarkdownComponent],
  template: `
    <div class="container">
      <article *ngIf="post$ | async as post; else loading">
        <p class="back"><a routerLink="/blog">&larr; All posts</a></p>
        <header class="post-head">
          <p class="badge" *ngIf="post.source === 'local'">Local draft · only visible in this browser</p>
          <div class="tags">
            <span class="tag" *ngFor="let t of post.tags">#{{ t }}</span>
          </div>
          <h1>{{ post.title }}</h1>
          <p class="meta">{{ post.date | date:'mediumDate' }}</p>
        </header>
        <markdown *ngIf="post.source === 'file'" [src]="markdownUrl(post.slug)"></markdown>
        <markdown *ngIf="post.source === 'local'" [data]="post.content"></markdown>
      </article>
      <ng-template #loading><p>Loading…</p></ng-template>
    </div>
  `,
  styles: [`
    article { max-width: 70ch; margin: 3rem auto; }
    .back { font-size: 0.875rem; margin-bottom: 1rem; }
    .back a { color: var(--fg-muted); text-decoration: none; }
    .back a:hover { color: var(--accent); }
    .post-head { padding-bottom: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); }
    .badge {
      display: inline-block;
      font-size: 0.7rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent-warm) 16%, transparent);
      color: var(--accent-warm);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 0.85rem;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
    .tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
      font-weight: 500;
    }
    h1 { margin: 0.25rem 0 0.5rem; font-size: clamp(1.75rem, 3vw, 2.5rem); }
    .meta { color: var(--fg-muted); font-size: 0.875rem; margin: 0; }
    :host ::ng-deep markdown { display: block; line-height: 1.75; font-size: 1.05rem; }
    :host ::ng-deep markdown h2 { margin-top: 2.5rem; font-size: 1.5rem; }
    :host ::ng-deep markdown h3 { margin-top: 2rem; }
    :host ::ng-deep markdown p { margin: 1.25rem 0; }
    :host ::ng-deep markdown pre { background: var(--code-bg); padding: 1rem 1.25rem; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border); }
    :host ::ng-deep markdown code { font-family: var(--font-mono); font-size: 0.9em; }
    :host ::ng-deep markdown :not(pre) > code { background: var(--code-bg); padding: 0.15em 0.4em; border-radius: 4px; }
    :host ::ng-deep markdown a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
    :host ::ng-deep markdown blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--fg-muted); margin: 1.5rem 0; }
  `],
})
export class BlogPostComponent implements OnInit {
  @Input() slug = '';
  private readonly service = inject(PostService);
  post$: Observable<PostListItem | undefined> = of(undefined);

  ngOnInit(): void {
    this.post$ = this.service.get(this.slug);
  }

  markdownUrl(slug: string): string {
    return this.service.markdownUrl(slug);
  }
}
