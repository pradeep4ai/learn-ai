import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand" aria-label="AI Learnings home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="var(--accent)"/>
                  <stop offset="1" stop-color="var(--accent-2)"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#brand-g)"/>
              <path d="M7 16 L12 7 L17 16 M9 13 H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </span>
          <span class="brand-text">AI <span class="amp">Learnings</span></span>
        </a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/blog" routerLinkActive="active">Blog</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .site-header {
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--bg) 80%, transparent);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.5rem;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      font-size: 1rem;
      color: var(--fg);
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    .brand-mark { width: 28px; height: 28px; display: inline-grid; place-items: center; }
    .brand-mark svg { width: 100%; height: 100%; border-radius: 7px; box-shadow: var(--shadow-sm); }
    .amp { color: var(--accent); font-weight: 800; }
    nav { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    nav a {
      color: var(--fg-muted);
      text-decoration: none;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      font-size: 0.92rem;
      transition: background 120ms ease, color 120ms ease;
    }
    nav a:hover { color: var(--fg); background: color-mix(in srgb, var(--fg) 6%, transparent); }
    nav a.active { color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
    nav a.admin-link {
      border: 1px dashed var(--border);
      font-size: 0.85rem;
    }
    nav a.admin-link:hover { border-color: var(--accent); color: var(--accent); }
  `],
})
export class HeaderComponent {}
