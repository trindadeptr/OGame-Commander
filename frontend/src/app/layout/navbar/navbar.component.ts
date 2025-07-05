import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-blue-600 shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/tasks" class="text-white text-xl font-bold">
              OGame Commander
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:block" *ngIf="currentUser">
            <div class="flex items-center space-x-4">
              <a routerLink="/tasks" 
                 routerLinkActive="bg-blue-700" 
                 class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Tasks
              </a>
              <a routerLink="/bots" 
                 routerLinkActive="bg-blue-700" 
                 class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Bots
              </a>
              <a *ngIf="isAdmin" 
                 routerLink="/universes" 
                 routerLinkActive="bg-blue-700" 
                 class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Universes
              </a>
              <a *ngIf="isAdmin" 
                 routerLink="/users" 
                 routerLinkActive="bg-blue-700" 
                 class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Users
              </a>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4" *ngIf="currentUser">
            <div class="text-white text-sm">
              Welcome, {{ currentUser.username }}
              <span *ngIf="isAdmin" class="ml-2 bg-blue-800 px-2 py-1 rounded text-xs">ADMIN</span>
            </div>
            <button (click)="logout()" 
                    class="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Logout
            </button>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden" *ngIf="currentUser">
            <button (click)="toggleMobileMenu()" 
                    class="text-white hover:bg-blue-700 p-2 rounded-md">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div class="md:hidden" *ngIf="currentUser && showMobileMenu">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-700">
            <a routerLink="/tasks" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-blue-700" 
               class="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium">
              Tasks
            </a>
            <a routerLink="/bots" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-blue-700" 
               class="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium">
              Bots
            </a>
            <a *ngIf="isAdmin" 
               routerLink="/universes" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-blue-700" 
               class="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium">
              Universes
            </a>
            <a *ngIf="isAdmin" 
               routerLink="/users" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-blue-700" 
               class="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium">
              Users
            </a>
            <div class="border-t border-blue-700 pt-2">
              <div class="text-white text-sm px-3 py-2">
                Welcome, {{ currentUser.username }}
                <span *ngIf="isAdmin" class="ml-2 bg-blue-800 px-2 py-1 rounded text-xs">ADMIN</span>
              </div>
              <button (click)="logout()" 
                      class="text-white hover:bg-blue-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  showMobileMenu = false;
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

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}
