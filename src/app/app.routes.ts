import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@features/home/home.component').then((m) => m.HomeComponent),
    title: 'AI Learnings & Tech',
  },
  {
    path: 'blog',
    loadChildren: () => import('@features/blog/blog.routes').then((m) => m.routes),
  },
  {
    path: 'about',
    loadComponent: () => import('@features/about/about.component').then((m) => m.AboutComponent),
    title: 'About',
  },
  {
    path: 'admin',
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.routes),
  },
  { path: '**', redirectTo: '' },
];
