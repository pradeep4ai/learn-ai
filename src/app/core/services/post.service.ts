import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map, shareReplay, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { PostMeta } from '@core/models/post';
import { PostListItem } from '@core/models/draft';
import { DraftService } from './draft.service';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly drafts = inject(DraftService);
  private readonly base = 'assets/posts';
  private readonly file$ = this.http
    .get<PostMeta[]>(`${this.base}/index.json`)
    .pipe(
      map((posts) => posts ?? []),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  private readonly drafts$ = toObservable(this.drafts.drafts).pipe(startWith(this.drafts.drafts()));

  list(): Observable<PostListItem[]> {
    return combineLatest([this.file$, this.drafts$]).pipe(
      map(([files, drafts]) => {
        const fileItems: PostListItem[] = files
          .filter((p) => !p.draft)
          .map((p) => ({ ...p, source: 'file' as const }));
        const draftItems: PostListItem[] = drafts.filter((d) => !d.draft);
        const merged = [...fileItems, ...draftItems];
        merged.sort((a, b) => (a.date < b.date ? 1 : -1));
        return merged;
      }),
    );
  }

  get(slug: string): Observable<PostListItem | undefined> {
    return this.list().pipe(map((all) => all.find((p) => p.slug === slug)));
  }

  markdownUrl(slug: string): string {
    return `${this.base}/${slug}.md`;
  }
}
