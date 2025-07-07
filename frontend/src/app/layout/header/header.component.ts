import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-gray-900 border-b border-gray-700 h-16 flex items-center justify-end px-6" *ngIf="currentUser">
      <div class="flex items-center space-x-4">
        <div class="text-gray-300 text-sm">
          Welcome, <span class="text-white font-medium">{{ currentUser.username }}</span>
          <span *ngIf="isAdmin" class="ml-2 bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">ADMIN</span>
        </div>
        
        <button (click)="logout()" 
                class="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors duration-200">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
