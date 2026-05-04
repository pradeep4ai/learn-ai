import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/admin-list.component').then((m) => m.AdminListComponent),
    title: 'Admin · Drafts',
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/admin-editor.component').then((m) => m.AdminEditorComponent),
    title: 'Admin · New post',
  },
  {
    path: 'edit/:slug',
    loadComponent: () => import('./pages/admin-editor.component').then((m) => m.AdminEditorComponent),
    title: 'Admin · Edit post',
  },
];
