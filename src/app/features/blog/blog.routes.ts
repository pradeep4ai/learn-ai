import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/blog-list.component').then((m) => m.BlogListComponent),
    title: 'Blog',
  },
  {
    path: ':slug',
    loadComponent: () => import('./pages/blog-post.component').then((m) => m.BlogPostComponent),
  },
];
