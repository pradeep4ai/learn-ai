import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { DraftService } from '@core/services/draft.service';
import { Draft } from '@core/models/draft';
import { isValidSlug, slugify } from '@core/utils/slug.util';
import { downloadMarkdown, parseMarkdown } from '@core/utils/markdown-export.util';

@Component({
  selector: 'app-admin-editor',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, RouterLink, MarkdownComponent],
  template: `
    <div class="container editor-page">
      <header class="page-head">
        <a routerLink="/admin" class="back">&larr; Back to drafts</a>
        <h1>{{ isEditing ? 'Edit post' : 'New post' }}</h1>
      </header>

      <p *ngIf="error()" class="error">{{ error() }}</p>
      <p *ngIf="saved()" class="ok">Saved.</p>

      <form #f="ngForm" (ngSubmit)="save()" novalidate class="form">
        <label class="field">
          <span>Title</span>
          <input
            name="title"
            [(ngModel)]="model.title"
            (ngModelChange)="onTitleChange($event)"
            maxlength="200"
            required
          />
        </label>

        <div class="row">
          <label class="field">
            <span>Slug <small class="hint">lowercase a-z, 0-9, hyphens</small></span>
            <input
              name="slug"
              [(ngModel)]="model.slug"
              [readonly]="isEditing"
              [ngClass]="{ invalid: !slugValid() }"
              required
            />
          </label>
          <label class="field">
            <span>Date</span>
            <input type="date" name="date" [(ngModel)]="model.date" required />
          </label>
        </div>

        <label class="field">
          <span>Description</span>
          <input name="description" [(ngModel)]="model.description" maxlength="400" />
        </label>

        <label class="field">
          <span>Tags <small class="hint">comma-separated</small></span>
          <input name="tagsStr" [(ngModel)]="tagsStr" placeholder="ai, llm, agents" />
        </label>

        <label class="checkbox">
          <input type="checkbox" name="draft" [(ngModel)]="model.draft" />
          <span>Mark as draft (excluded from public site when exported)</span>
        </label>

        <label class="field">
          <span>Content (Markdown)</span>
          <textarea
            name="content"
            [(ngModel)]="model.content"
            rows="18"
            spellcheck="true"
            placeholder="Write Markdown here..."
          ></textarea>
        </label>

        <div class="actions">
          <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update' : 'Create' }}</button>
          <button type="button" class="btn btn-ghost" (click)="export()" [disabled]="!isEditing">Export .md</button>
          <label class="btn btn-ghost import-btn">
            Import .md
            <input type="file" accept=".md,text/markdown" (change)="onImport($event)" hidden />
          </label>
          <button type="button" class="btn btn-danger" (click)="remove()" *ngIf="isEditing">Delete</button>
        </div>
      </form>

      <section class="preview" *ngIf="model.content">
        <h2>Preview</h2>
        <markdown [data]="model.content"></markdown>
      </section>
    </div>
  `,
  styles: [`
    .editor-page { padding: 3rem 0; max-width: 880px; }
    .page-head { margin-bottom: 1.5rem; }
    .back { font-size: 0.875rem; color: var(--fg-muted); text-decoration: none; }
    .back:hover { color: var(--accent); }
    h1 { font-size: 2rem; margin: 0.5rem 0 0; }
    .form { display: grid; gap: 1rem; }
    .field { display: grid; gap: 0.35rem; }
    .field span { font-weight: 600; font-size: 0.92rem; }
    .field .hint { color: var(--fg-muted); font-weight: 400; font-size: 0.78rem; margin-left: 0.4rem; }
    .field input,
    .field textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--fg);
      font-family: inherit;
      font-size: 0.95rem;
    }
    .field textarea { font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.6; resize: vertical; }
    .field input:focus,
    .field textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }
    .field input.invalid { border-color: #d23f3f; }
    .field input[readonly] { background: var(--bg-elev); color: var(--fg-muted); cursor: not-allowed; }
    .row { display: grid; grid-template-columns: 1fr 200px; gap: 1rem; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
    .checkbox { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--fg-muted); font-size: 0.92rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.5rem; }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      border: 0;
      cursor: pointer;
      transition: transform 120ms ease, background 120ms ease;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: var(--shadow-md); }
    .btn-primary:hover:not(:disabled) { background: var(--accent-strong); transform: translateY(-1px); }
    .btn-ghost { color: var(--fg); border: 1px solid var(--border); background: transparent; }
    .btn-ghost:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-danger { background: #d23f3f; color: #fff; }
    .btn-danger:hover:not(:disabled) { background: #b53030; }
    .import-btn { cursor: pointer; }
    .error { color: #d23f3f; background: color-mix(in srgb, #d23f3f 10%, transparent); padding: 0.65rem 0.9rem; border-radius: var(--radius); margin: 0; }
    .ok { color: #2a8a3e; background: color-mix(in srgb, #2a8a3e 12%, transparent); padding: 0.65rem 0.9rem; border-radius: var(--radius); margin: 0; }
    .preview { margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border); }
    .preview h2 { margin: 0 0 1rem; font-size: 1.2rem; color: var(--fg-muted); }
    :host ::ng-deep .preview markdown { display: block; line-height: 1.75; }
    :host ::ng-deep .preview markdown pre { background: var(--code-bg); padding: 1rem; border-radius: 8px; overflow-x: auto; }
    :host ::ng-deep .preview markdown :not(pre) > code { background: var(--code-bg); padding: 0.15em 0.4em; border-radius: 4px; }
  `],
})
export class AdminEditorComponent implements OnInit {
  @Input() slug: string | null = null;

  private readonly drafts = inject(DraftService);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);

  isEditing = false;
  tagsStr = '';
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  model: Omit<Draft, 'updatedAt' | 'source'> = {
    slug: '',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    description: '',
    draft: true,
    content: '',
  };

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (this.slug) {
      const existing = this.drafts.get(this.slug);
      if (existing) {
        this.model = { ...existing };
        this.tagsStr = existing.tags.join(', ');
        this.isEditing = true;
      } else {
        this.error.set(`No draft found for "${this.slug}".`);
      }
    }
  }

  slugValid(): boolean {
    return !this.model.slug || isValidSlug(this.model.slug);
  }

  onTitleChange(title: string): void {
    if (!this.isEditing && (!this.model.slug || this.model.slug === slugify(this.previousTitle))) {
      this.model.slug = slugify(title);
    }
    this.previousTitle = title;
  }
  private previousTitle = '';

  save(): void {
    this.error.set(null);
    this.saved.set(false);
    this.model.tags = this.tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      if (this.isEditing) {
        this.drafts.update(this.model.slug, this.model);
      } else {
        this.drafts.create(this.model);
        this.router.navigate(['/admin/edit', this.model.slug]);
      }
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  remove(): void {
    if (!this.isEditing) return;
    if (confirm(`Delete draft "${this.model.slug}"? This cannot be undone.`)) {
      this.drafts.remove(this.model.slug);
      this.router.navigate(['/admin']);
    }
  }

  export(): void {
    if (!this.isEditing) return;
    const d = this.drafts.get(this.model.slug);
    if (d) downloadMarkdown(d);
  }

  onImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      this.error.set('File too large (max 1 MB).');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseMarkdown(String(reader.result ?? ''));
        const slug = this.model.slug || slugify(parsed.title || file.name.replace(/\.md$/i, ''));
        this.model = {
          slug,
          title: parsed.title,
          date: parsed.date,
          tags: parsed.tags,
          description: parsed.description,
          draft: parsed.draft,
          content: parsed.content,
        };
        this.tagsStr = parsed.tags.join(', ');
        this.error.set(null);
      } catch (err) {
        this.error.set(err instanceof Error ? err.message : 'Import failed.');
      } finally {
        input.value = '';
      }
    };
    reader.onerror = () => {
      this.error.set('Failed to read file.');
      input.value = '';
    };
    reader.readAsText(file);
  }
}
