import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container">
      <article>
        <span class="eyebrow">About</span>
        <h1>A notebook for AI learnings</h1>
        <p>This is a personal notebook of what I'm learning about AI — LLMs, agents, prompting, evals, and the rough edges between a working demo and something that actually ships.</p>
        <p>The posts are short and practical. If something I tried failed, it goes here too — the misses are usually more useful to read than the wins.</p>

        <h2>Topics I write about</h2>
        <ul class="topics">
          <li><strong>LLMs &amp; reasoning</strong> — model behavior, prompting patterns, where they break.</li>
          <li><strong>Agents &amp; tools</strong> — tool use, planning, multi-step workflows.</li>
          <li><strong>Evals &amp; quality</strong> — measuring whether an AI system is actually any good.</li>
          <li><strong>Postmortems</strong> — what broke, why, and what I'd do differently.</li>
        </ul>

        <h2>How drafts work</h2>
        <p>The site has a private <a href="/admin">admin</a> page where I write and edit posts. Drafts live in my browser only — nothing is synced or stored on a server. When a draft is ready, I export it as a Markdown file and commit it; that's how a post becomes public.</p>
      </article>
    </div>
  `,
  styles: [`
    article { max-width: 70ch; margin: 3rem auto; }
    .eyebrow {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--fg-muted);
      margin-bottom: 0.75rem;
    }
    h1 { font-size: clamp(1.75rem, 3vw, 2.5rem); margin: 0 0 1.5rem; }
    h2 { margin: 2.5rem 0 1rem; font-size: 1.4rem; }
    p { line-height: 1.75; font-size: 1.05rem; }
    .topics { list-style: none; padding: 0; display: grid; gap: 0.6rem; }
    .topics li {
      padding: 0.85rem 1rem;
      background: var(--bg-elev);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius);
    }
    .topics strong { color: var(--fg); }
  `],
})
export class AboutComponent {}
