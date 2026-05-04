#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'content', 'posts');
const outDir = join(root, 'src', 'assets', 'posts');
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

const POST_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;

async function safeUnlink(path) {
  for (let i = 0; i < 5; i++) {
    try {
      await unlink(path);
      return;
    } catch (err) {
      if (err.code === 'ENOENT') return;
      if (i === 4) throw err;
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const f of await readdir(outDir).catch(() => [])) {
    if (f.endsWith('.md') || f === 'index.json') {
      await safeUnlink(join(outDir, f));
    }
  }

  if (!existsSync(srcDir)) {
    console.warn(`[posts] no ${srcDir} — writing empty index.`);
    await writeFile(join(outDir, 'index.json'), '[]\n');
    return;
  }

  const files = (await readdir(srcDir)).filter((f) => f.endsWith('.md'));
  const index = [];

  for (const file of files) {
    const m = file.match(POST_RE);
    if (!m) {
      const isVariant = /\.(linkedin|twitter|threads)\.md$/.test(file);
      if (!isVariant) console.warn(`[posts] skipping ${file}: filename must be YYYY-MM-DD-slug.md`);
      continue;
    }
    const [, date, slug] = m;
    const raw = await readFile(join(srcDir, file), 'utf8');
    const { data, content } = matter(raw);

    if (isProd && data.draft === true) continue;

    const meta = {
      slug,
      title: data.title ?? slug,
      date: data.date ? new Date(data.date).toISOString().slice(0, 10) : date,
      tags: Array.isArray(data.tags) ? data.tags : [],
      description: data.description ?? '',
      draft: data.draft === true,
    };

    await writeFile(join(outDir, `${slug}.md`), content.trimStart());
    index.push(meta);
  }

  index.sort((a, b) => (a.date < b.date ? 1 : -1));
  await writeFile(join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  console.log(`[posts] wrote ${index.length} post(s) to src/assets/posts/`);
}

main().catch((err) => {
  console.error('[posts] failed:', err);
  process.exit(1);
});
