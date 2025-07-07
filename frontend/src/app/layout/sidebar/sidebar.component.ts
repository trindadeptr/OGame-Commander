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
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
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
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Tasks</span>
            </a>
          </li>
          
          <li>
            <a routerLink="/bots" 
               routerLinkActive="bg-blue-600" 
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>Bots</span>
            </a>
          </li>
          
          <li *ngIf="isAdmin">
            <a routerLink="/universes" 
               routerLinkActive="bg-blue-600" 
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Universes</span>
              <span class="ml-auto bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">ADMIN</span>
            </a>
          </li>
          
          <li *ngIf="isAdmin">
            <a routerLink="/users" 
               routerLinkActive="bg-blue-600" 
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
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
