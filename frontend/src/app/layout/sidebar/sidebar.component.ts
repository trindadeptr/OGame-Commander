import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sidebar -->
    <div class="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <!-- Logo/Header -->
      <div class="p-6 border-b border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
            </svg>
          </div>
          <span class="text-xl font-bold">OGame Commander</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4" *ngIf="currentUser">
        <ul class="space-y-2">
          <li>
            <a routerLink="/tasks"
               routerLinkActive="bg-blue-600"
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-todo h-5 w-5"><rect x="3" y="5" width="6" height="6" rx="1"></rect><path d="m3 17 2 2 4-4"></path><path d="M13 6h8"></path><path d="M13 12h8"></path><path d="M13 18h8"></path></svg>
              <span>Tasks</span>
            </a>
          </li>

          <li>
            <a routerLink="/bots"
               routerLinkActive="bg-blue-600"
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot h-5 w-5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              <span>Bots</span>
            </a>
          </li>

          <li *ngIf="isAdmin">
            <a routerLink="/universes"
               routerLinkActive="bg-blue-600"
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
              <span>Universes</span>
              <span class="ml-auto bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">ADMIN</span>
            </a>
          </li>

          <li *ngIf="isAdmin">
            <a routerLink="/users"
               routerLinkActive="bg-blue-600"
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>Users</span>
              <span class="ml-auto bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">ADMIN</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAdmin = this.authService.isAdmin();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
