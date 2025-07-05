import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then(c => c.TaskListComponent)
  },
  {
    path: 'tasks/create',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/task-create/task-create.component').then(c => c.TaskCreateComponent)
  },
  {
    path: 'tasks/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/task-detail/task-detail.component').then(c => c.TaskDetailComponent)
  },
  {
    path: 'bots',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bots/bot-list/bot-list.component').then(c => c.BotListComponent)
  },
  {
    path: 'universes',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/universes/universe-list/universe-list.component').then(c => c.UniverseListComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/user-list/user-list.component').then(c => c.UserListComponent)
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];
