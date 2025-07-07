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
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">User Management</h1>
          <p class="text-gray-400 mt-1">Manage system users and their permissions</p>
        </div>
        <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>{{ showCreateForm ? 'Cancel' : 'Add User' }}</span>
        </button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-white">Create New User</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Username *</label>
                <input type="text" formControlName="username" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                <input type="password" formControlName="password" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Role *</label>
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
          <table class="min-w-full divide-y divide-gray-600">
            <thead class="bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Access</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-600">
              <tr *ngFor="let user of users" class="hover:bg-gray-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-200">{{ user.username }}</div>
                      <div class="text-sm text-gray-400">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': user.role === 'ADMIN',
                          'bg-blue-100 text-blue-800': user.role === 'USER'
                        }">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': !user.disabled,
                          'bg-red-100 text-red-800': user.disabled
                        }">
                    {{ user.disabled ? 'Inactive' : 'Active' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ user.lastAccessAt ? (user.lastAccessAt | date:'short') : 'Never' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button (click)="toggleUserStatus(user)" 
                          class="px-3 py-1 rounded text-xs transition-colors"
                          [ngClass]="user.disabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'">
                    <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path *ngIf="user.disabled" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path *ngIf="!user.disabled" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                    </svg>
                    {{ user.disabled ? 'Enable' : 'Disable' }}
                  </button>
                  <button (click)="toggleUserRole(user)" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                    <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    {{ user.role === 'ADMIN' ? 'Make User' : 'Make Admin' }}
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
