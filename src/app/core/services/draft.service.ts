import { Injectable, signal } from '@angular/core';
import { Draft } from '@core/models/draft';
import { isValidSlug } from '@core/utils/slug.util';

const STORAGE_KEY = 'ai-learnings.drafts.v1';
const MAX_TITLE = 200;
const MAX_DESC = 400;
const MAX_CONTENT = 200_000;

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['slug'] === 'string' &&
    isValidSlug(v['slug'] as string) &&
    typeof v['title'] === 'string' &&
    typeof v['date'] === 'string' &&
    Array.isArray(v['tags']) &&
    typeof v['description'] === 'string' &&
    typeof v['draft'] === 'boolean' &&
    typeof v['content'] === 'string' &&
    typeof v['updatedAt'] === 'string' &&
    v['source'] === 'local'
  );
}

@Injectable({ providedIn: 'root' })
export class DraftService {
  private readonly storage = this.safeStorage();
  private readonly _drafts = signal<Draft[]>(this.load());
  readonly drafts = this._drafts.asReadonly();

  list(): Draft[] {
    return [...this._drafts()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  get(slug: string): Draft | undefined {
    return this._drafts().find((d) => d.slug === slug);
  }

  create(input: Omit<Draft, 'updatedAt' | 'source'>): Draft {
    this.validate(input);
    if (this.get(input.slug)) {
      throw new Error(`A draft with slug "${input.slug}" already exists.`);
    }
    const draft: Draft = { ...input, updatedAt: new Date().toISOString(), source: 'local' };
    this._drafts.update((list) => [...list, draft]);
    this.persist();
    return draft;
  }

  update(slug: string, patch: Partial<Omit<Draft, 'slug' | 'source'>>): Draft {
    const existing = this.get(slug);
    if (!existing) throw new Error(`No draft with slug "${slug}".`);
    const next: Draft = {
      ...existing,
      ...patch,
      slug: existing.slug,
      source: 'local',
      updatedAt: new Date().toISOString(),
    };
    this.validate(next);
    this._drafts.update((list) => list.map((d) => (d.slug === slug ? next : d)));
    this.persist();
    return next;
  }

  remove(slug: string): void {
    this._drafts.update((list) => list.filter((d) => d.slug !== slug));
    this.persist();
  }

  private validate(d: Omit<Draft, 'updatedAt' | 'source'>): void {
    if (!isValidSlug(d.slug)) throw new Error('Slug must be lowercase a-z, 0-9, with single hyphens.');
    if (!d.title.trim()) throw new Error('Title is required.');
    if (d.title.length > MAX_TITLE) throw new Error(`Title is too long (max ${MAX_TITLE}).`);
    if (d.description.length > MAX_DESC) throw new Error(`Description is too long (max ${MAX_DESC}).`);
    if (d.content.length > MAX_CONTENT) throw new Error(`Content is too long (max ${MAX_CONTENT}).`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) throw new Error('Date must be YYYY-MM-DD.');
    if (!Array.isArray(d.tags) || d.tags.some((t) => typeof t !== 'string')) {
      throw new Error('Tags must be an array of strings.');
    }
  }

  private load(): Draft[] {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isDraft);
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this._drafts()));
    } catch (err) {
      console.error('[drafts] failed to persist', err);
    }
  }

  private safeStorage(): Storage | null {
    try {
      const t = '__draft_test__';
      localStorage.setItem(t, t);
      localStorage.removeItem(t);
      return localStorage;
    } catch {
      return null;
    }
  }
}
