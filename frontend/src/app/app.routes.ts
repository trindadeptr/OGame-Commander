import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { UniverseComponent } from './universe/universe.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { authGuard, roleGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'tasks/create', component: TaskCreateComponent, canActivate: [authGuard] },
  { path: 'tasks/:id', component: TaskDetailComponent, canActivate: [authGuard] },
  { path: 'universes', component: UniverseComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: '', pathMatch: 'full', redirectTo: 'tasks' }
];
