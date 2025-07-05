import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService } from '../../../core/services/bot.service';
import { Bot } from '../../../core/models';

@Component({
  selector: 'app-bot-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Bots</h1>
        <button 
          (click)="refreshBots()" 
          [disabled]="isLoading"
          class="btn-primary">
          <span *ngIf="isLoading" class="loading-spinner mr-2"></span>
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {{ errorMessage }}
      </div>

      <!-- Bots Grid -->
      <div *ngIf="!isLoading && !errorMessage" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let bot of bots" class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ bot.name }}</h3>
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Universe</label>
                <p class="text-gray-900">{{ bot.universe.name }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">UUID</label>
                <p class="text-gray-900 font-mono text-sm break-all">{{ bot.uuid }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Seen</label>
                <p class="text-gray-900 text-sm">
                  {{ bot.lastSeenAt | date:'medium' }}
                  <span class="text-gray-500">({{ getTimeSinceLastSeen(bot.lastSeenAt) }})</span>
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p class="text-gray-900 text-sm">{{ bot.createdAt | date:'medium' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Universe URL</label>
                <a [href]="bot.universe.url" 
                   target="_blank" 
                   class="text-blue-600 hover:text-blue-900 text-sm break-all">
                  {{ bot.universe.url }}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="bots.length === 0" class="col-span-full">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No bots found</h3>
            <p class="mt-1 text-sm text-gray-500">
              No bots have been registered yet. Bots will appear here once they connect to the backend.
            </p>
          </div>
        </div>
      </div>

      <!-- Summary Statistics -->
      <div *ngIf="bots.length > 0 && !isLoading" class="mt-8">
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">Bot Statistics</h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ bots.length }}</div>
                <div class="text-sm text-gray-500">Total Bots</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ getActiveBots() }}</div>
                <div class="text-sm text-gray-500">Active Bots</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-600">{{ getInactiveBots() }}</div>
                <div class="text-sm text-gray-500">Inactive Bots</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ getUniqueUniverses() }}</div>
                <div class="text-sm text-gray-500">Universes</div>
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
    return this.bots.filter(bot => bot.status === 'ACTIVE').length;
  }

  getInactiveBots(): number {
    return this.bots.filter(bot => bot.status === 'INACTIVE').length;
  }

  getUniqueUniverses(): number {
    const universeIds = new Set(this.bots.map(bot => bot.universe.id));
    return universeIds.size;
  }
}
