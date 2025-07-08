import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService } from '../../../core/services/bot.service';
import { Bot } from '../../../core/models';

@Component({
  selector: 'app-bot-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">Bot Monitoring</h1>
          <p class="text-gray-400 mt-1">Monitor and manage your OGame automation bots</p>
        </div>
        <button
          (click)="refreshBots()"
          [disabled]="isLoading"
          class="btn-primary">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>Add Bot</span>
        </button>
      </div>

      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ bots.length || 0 }}</div>
              <div class="metric-label">Total Bots</div>
            </div>
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ getActiveBots() }}</div>
              <div class="metric-label">Online</div>
            </div>
            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ getInactiveBots() }}</div>
              <div class="metric-label">Offline</div>
            </div>
            <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ getWorkingBots() }}</div>
              <div class="metric-label">Working</div>
            </div>
            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
        {{ errorMessage }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && !errorMessage && bots && bots.length === 0" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-400 mb-2">No bots registered</h3>
          <p class="text-gray-500">Register your first bot to start automation</p>
        </div>
      </div>

      <!-- Bots Grid -->
      <div *ngIf="!isLoading && !errorMessage && bots && bots.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let bot of bots" class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">{{ bot.name }}</h3>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800': bot.status === 'ACTIVE',
                      'bg-gray-100 text-gray-800': bot.status === 'INACTIVE'
                    }">
                {{ bot.status }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Universe</label>
                <p class="text-gray-200">{{ bot.universe.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">UUID</label>
                <p class="text-gray-200 font-mono text-sm break-all">{{ bot.uuid }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Last Seen</label>
                <p class="text-gray-200 text-sm">
                  <span *ngIf="bot.lastSeenAt; else neverSeen">
                    {{ bot.lastSeenAt | date:'medium' }}
                    <span class="text-gray-400">({{ getTimeSinceLastSeen(bot.lastSeenAt) }})</span>
                  </span>
                  <ng-template #neverSeen>
                    <span class="text-gray-500">Never</span>
                  </ng-template>
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Created</label>
                <p class="text-gray-200 text-sm">{{ bot.createdAt | date:'medium' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Universe URL</label>
                <p class="text-gray-200 text-sm">{{ bot.universe.url }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class BotListComponent implements OnInit {
  bots: Bot[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private botService: BotService) {}

  ngOnInit(): void {
    this.loadBots();
  }

  loadBots(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.botService.getBots().subscribe({
      next: (bots) => {
        this.bots = bots;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load bots';
        this.isLoading = false;
      }
    });
  }

  refreshBots(): void {
    this.loadBots();
  }

  getTimeSinceLastSeen(lastSeenAt: string): string {
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getActiveBots(): number {
    return this.bots?.filter(bot => bot.status === 'ACTIVE').length || 0;
  }

  getInactiveBots(): number {
    return this.bots?.filter(bot => bot.status === 'INACTIVE').length || 0;
  }

  getUniqueUniverses(): number {
    if (!this.bots) return 0;
    const universeIds = new Set(this.bots.map(bot => bot.universe.id));
    return universeIds.size;
  }

  getWorkingBots(): number {
    if (!this.bots) return 0;
    // Assuming working bots are those that are active and have been seen recently (within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return this.bots.filter(bot =>
      bot.status === 'ACTIVE' &&
      new Date(bot.lastSeenAt) > tenMinutesAgo
    ).length;
  }
}
