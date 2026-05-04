import { Draft } from '@core/models/draft';

function escapeFrontmatterString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function draftToMarkdown(draft: Draft): string {
  const tags = (draft.tags ?? []).map((t) => `"${escapeFrontmatterString(t)}"`).join(', ');
  const fm = [
    '---',
    `title: "${escapeFrontmatterString(draft.title)}"`,
    `date: ${draft.date}`,
    `tags: [${tags}]`,
    `description: "${escapeFrontmatterString(draft.description)}"`,
    `draft: ${draft.draft ? 'true' : 'false'}`,
    '---',
    '',
    draft.content.trimStart(),
    '',
  ];
  return fm.join('\n');
}

export function draftFilename(draft: Draft): string {
  return `${draft.date}-${draft.slug}.md`;
}

export function downloadMarkdown(draft: Draft): void {
  const blob = new Blob([draftToMarkdown(draft)], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = draftFilename(draft);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface ParsedMarkdown {
  title: string;
  date: string;
  tags: string[];
  description: string;
  draft: boolean;
  content: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseMarkdown(raw: string): ParsedMarkdown {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) {
    return {
      title: '',
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      description: '',
      draft: true,
      content: raw,
    };
  }
  const [, fm, body] = m;
  const data: Record<string, string> = {};
  for (const line of fm.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!kv) continue;
    data[kv[1]] = kv[2];
  }
  const tagsRaw = data['tags'] ?? '[]';
  const tagsMatch = tagsRaw.match(/\[([^\]]*)\]/);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    : [];
  const stripQuotes = (v: string | undefined) => (v ?? '').replace(/^["']|["']$/g, '');
  return {
    title: stripQuotes(data['title']),
    date: stripQuotes(data['date']) || new Date().toISOString().slice(0, 10),
    tags,
    description: stripQuotes(data['description']),
    draft: stripQuotes(data['draft']).toLowerCase() === 'true',
    content: body ?? '',
  };
}
