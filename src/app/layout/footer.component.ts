import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <div class="footer-stripe" aria-hidden="true"></div>
      <div class="container footer-inner">
        <p>&copy; {{ year }} &middot; AI Learnings</p>
        <p class="muted">Notes &amp; findings on AI</p>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      margin-top: 5rem;
      padding-bottom: 2rem;
      color: var(--fg-muted);
      font-size: 0.875rem;
    }
    .footer-stripe {
      height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3), var(--accent-warm));
      margin-bottom: 2rem;
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .footer-inner p { margin: 0; }
    .muted { color: var(--fg-muted); }
  `],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
