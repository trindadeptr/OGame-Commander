import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Users</h1>
        <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
          {{ showCreateForm ? 'Cancel' : 'Add User' }}
        </button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-semibold">Create New User</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" formControlName="username" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" formControlName="password" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select formControlName="role" class="input-field">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
              <button type="button" (click)="cancelCreate()" class="btn-secondary">Cancel</button>
              <button type="submit" [disabled]="userForm.invalid || isLoading" class="btn-primary">
                {{ isLoading ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Access</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of users" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ user.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ user.username }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-red-100 text-red-800': user.role === 'ADMIN',
                          'bg-blue-100 text-blue-800': user.role === 'USER'
                        }">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': !user.disabled,
                          'bg-gray-100 text-gray-800': user.disabled
                        }">
                    {{ user.disabled ? 'Disabled' : 'Active' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.lastAccessAt | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button (click)="toggleUserStatus(user)" 
                          [class]="user.disabled ? 'btn-success' : 'btn-secondary'"
                          class="text-xs px-2 py-1">
                    {{ user.disabled ? 'Enable' : 'Disable' }}
                  </button>
                  <button (click)="toggleUserRole(user)" class="btn-secondary text-xs px-2 py-1">
                    Make {{ user.role === 'ADMIN' ? 'User' : 'Admin' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  showCreateForm = false;
  isLoading = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => console.error('Error loading users:', error)
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const request: CreateUserRequest = this.userForm.value;
      
      this.userService.createUser(request).subscribe({
        next: () => { this.loadUsers(); this.cancelCreate(); },
        error: () => this.isLoading = false,
        complete: () => this.isLoading = false
      });
    }
  }

  toggleUserStatus(user: User): void {
    const update: UpdateUserRequest = { disabled: !user.disabled };
    this.userService.updateUser(user.id, update).subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Error updating user:', error)
    });
  }

  toggleUserRole(user: User): void {
    const update: UpdateUserRequest = { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' };
    this.userService.updateUser(user.id, update).subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Error updating user:', error)
    });
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.userForm.reset({ role: 'USER' });
  }
}
