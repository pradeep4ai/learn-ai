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
    <div class="editor-page">
      <header class="page-head">
        <a routerLink="/admin" class="back">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Drafts
        </a>
        <h1>{{ isEditing ? 'Edit post' : 'New post' }}</h1>
      </header>

      <div *ngIf="error()" class="alert alert-error">{{ error() }}</div>
      <div *ngIf="saved()" class="alert alert-ok">Saved.</div>

      <form #f="ngForm" (ngSubmit)="save()" novalidate class="form">
        <label class="field">
          <span class="label">Title</span>
          <input
            name="title"
            [(ngModel)]="model.title"
            (ngModelChange)="onTitleChange($event)"
            maxlength="200"
            placeholder="A short, clear title"
            required
          />
        </label>

        <div class="row">
          <label class="field">
            <span class="label">Slug</span>
            <input
              name="slug"
              [(ngModel)]="model.slug"
              [readonly]="isEditing"
              [ngClass]="{ invalid: !slugValid() }"
              placeholder="lowercase-with-hyphens"
              required
            />
          </label>
          <label class="field">
            <span class="label">Date</span>
            <input type="date" name="date" [(ngModel)]="model.date" required />
          </label>
        </div>

        <label class="field">
          <span class="label">Description</span>
          <input
            name="description"
            [(ngModel)]="model.description"
            maxlength="400"
            placeholder="One-sentence summary for the blog list"
          />
        </label>

        <label class="field">
          <span class="label">Tags</span>
          <input
            name="tagsStr"
            [(ngModel)]="tagsStr"
            placeholder="ai, llm, agents (comma-separated)"
          />
        </label>

        <label class="checkbox">
          <input type="checkbox" name="draft" [(ngModel)]="model.draft" />
          <span>Mark as draft</span>
        </label>

        <label class="field">
          <span class="label">Content</span>
          <textarea
            name="content"
            [(ngModel)]="model.content"
            rows="16"
            spellcheck="true"
            placeholder="Write Markdown here…"
          ></textarea>
        </label>

        <div class="actions">
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Save changes' : 'Create draft' }}
          </button>
          <button type="button" class="btn btn-ghost" (click)="export()" [disabled]="!isEditing">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export .md
          </button>
          <label class="btn btn-ghost import-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import .md
            <input type="file" accept=".md,text/markdown" (change)="onImport($event)" hidden />
          </label>
          <button type="button" class="btn btn-danger" (click)="remove()" *ngIf="isEditing">Delete</button>
        </div>
      </form>

      <section class="preview" *ngIf="model.content">
        <header class="preview-head">
          <span class="eyebrow">Preview</span>
        </header>
        <markdown [data]="model.content"></markdown>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .editor-page {
      max-width: 760px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem 4rem;
    }
    .page-head { margin-bottom: 1.5rem; }
    .back {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--fg-muted);
      text-decoration: none;
      margin-bottom: 0.75rem;
    }
    .back:hover { color: var(--accent); }
    h1 { font-size: 2rem; margin: 0; letter-spacing: -0.02em; }

    .alert {
      padding: 0.7rem 1rem;
      border-radius: var(--radius);
      font-size: 0.92rem;
      margin: 0 0 1.25rem;
      border: 1px solid transparent;
    }
    .alert-error { color: #b53030; background: color-mix(in srgb, #d23f3f 10%, transparent); border-color: color-mix(in srgb, #d23f3f 30%, transparent); }
    .alert-ok { color: #1f6f3a; background: color-mix(in srgb, #2a8a3e 10%, transparent); border-color: color-mix(in srgb, #2a8a3e 30%, transparent); }

    .form { display: grid; gap: 1.1rem; }
    .field { display: grid; gap: 0.4rem; }
    .label {
      font-weight: 600;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--fg-muted);
    }
    .field input,
    .field textarea {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--fg);
      font-family: inherit;
      font-size: 0.95rem;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    .field textarea {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      line-height: 1.65;
      resize: vertical;
      min-height: 360px;
    }
    .field input::placeholder,
    .field textarea::placeholder { color: var(--fg-muted); opacity: 0.6; }
    .field input:focus,
    .field textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .field input.invalid { border-color: #d23f3f; }
    .field input.invalid:focus { box-shadow: 0 0 0 3px color-mix(in srgb, #d23f3f 18%, transparent); }
    .field input[readonly] { background: var(--bg-elev); color: var(--fg-muted); cursor: not-allowed; }

    .row { display: grid; grid-template-columns: 1fr 200px; gap: 1rem; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }

    .checkbox {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      color: var(--fg-muted);
      font-size: 0.9rem;
      cursor: pointer;
      user-select: none;
    }
    .checkbox input { accent-color: var(--accent); width: 16px; height: 16px; }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.1rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.88rem;
      border: 1px solid transparent;
      cursor: pointer;
      transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
    }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--accent-strong); transform: translateY(-1px); }
    .btn-ghost { color: var(--fg); border-color: var(--border); background: transparent; }
    .btn-ghost:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-danger { background: transparent; color: #d23f3f; border-color: color-mix(in srgb, #d23f3f 40%, transparent); margin-left: auto; }
    .btn-danger:hover:not(:disabled) { background: #d23f3f; color: #fff; border-color: #d23f3f; }
    .import-btn { cursor: pointer; }

    .preview {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }
    .preview-head { margin-bottom: 1.25rem; }
    .preview .eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--fg-muted);
    }
    :host ::ng-deep .preview markdown { display: block; line-height: 1.75; font-size: 1rem; }
    :host ::ng-deep .preview markdown h1 { font-size: 1.6rem; margin: 1.5rem 0 0.5rem; }
    :host ::ng-deep .preview markdown h2 { font-size: 1.3rem; margin: 1.5rem 0 0.5rem; }
    :host ::ng-deep .preview markdown h3 { font-size: 1.1rem; margin: 1.25rem 0 0.4rem; }
    :host ::ng-deep .preview markdown p { margin: 1rem 0; }
    :host ::ng-deep .preview markdown pre { background: var(--code-bg); padding: 1rem; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border); }
    :host ::ng-deep .preview markdown :not(pre) > code { background: var(--code-bg); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    :host ::ng-deep .preview markdown a { color: var(--accent); }
    :host ::ng-deep .preview markdown blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--fg-muted); margin: 1.5rem 0; }

    @media (max-width: 540px) {
      .editor-page { padding: 2rem 1rem 3rem; }
      h1 { font-size: 1.6rem; }
      .btn-danger { margin-left: 0; }
    }
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
