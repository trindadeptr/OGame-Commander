import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-900 flex">
      <!-- Authenticated Layout -->
      <ng-container *ngIf="currentUser">
        <app-sidebar></app-sidebar>
        <div class="flex-1 flex flex-col">
          <app-header></app-header>
          <main class="flex-1 bg-gray-900 p-6">
            <router-outlet></router-outlet>
          </main>
        </div>
      </ng-container>
      
      <!-- Unauthenticated Layout -->
      <ng-container *ngIf="!currentUser">
        <div class="flex-1">
          <router-outlet></router-outlet>
        </div>
      </ng-container>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OGame Commander';
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
