import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskResult } from '../../../core/models';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center mb-6">
          <button 
            (click)="goBack()" 
            class="mr-4 text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">
            Task #{{ task?.id || taskId }}
          </h1>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-8">
          <div class="loading-spinner"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {{ errorMessage }}
        </div>

        <!-- Task Details -->
        <div *ngIf="task && !isLoading" class="space-y-6">
          <!-- Basic Information -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold">Task Information</h2>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task ID</label>
                  <p class="text-gray-900">{{ task.id }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': task.type === 'CHECK_ACTIVITY',
                          'bg-purple-100 text-purple-800': task.type === 'SPY_PLAYER'
                        }">
                    {{ task.type | titlecase }}
                  </span>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': task.status === 'CREATED',
                          'bg-blue-100 text-blue-800': task.status === 'IN_PROGRESS',
                          'bg-green-100 text-green-800': task.status === 'FINISHED',
                          'bg-red-100 text-red-800': task.status === 'ERROR'
                        }">
                    {{ task.status | titlecase }}
                  </span>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Universe</label>
                  <p class="text-gray-900">{{ task.universe.name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                  <p class="text-gray-900">{{ task.playerName || '-' }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bot</label>
                  <p class="text-gray-900">{{ task.bot?.name || 'Not assigned' }}</p>
                </div>
                
                <div *ngIf="task.recurrenceMinutes">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                  <p class="text-gray-900">Every {{ task.recurrenceMinutes }} minutes</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p class="text-gray-900">{{ task.createdAt | date:'medium' }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                  <p class="text-gray-900">{{ task.updatedAt | date:'medium' }}</p>
                </div>
                
                <div *ngIf="task.scheduledAt">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Scheduled</label>
                  <p class="text-gray-900">{{ task.scheduledAt | date:'medium' }}</p>
                </div>
                
                <div *ngIf="task.startedAt">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Started</label>
                  <p class="text-gray-900">{{ task.startedAt | date:'medium' }}</p>
                </div>
                
                <div *ngIf="task.completedAt">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Completed</label>
                  <p class="text-gray-900">{{ task.completedAt | date:'medium' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Task Parameters -->
          <div *ngIf="task.taskParams" class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold">Task Parameters</h2>
            </div>
            <div class="card-body">
              <pre class="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">{{ formatJson(task.taskParams) }}</pre>
            </div>
          </div>

          <!-- Universe Details -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold">Universe Details</h2>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p class="text-gray-900">{{ task.universe.name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <a [href]="task.universe.url" 
                     target="_blank" 
                     class="text-blue-600 hover:text-blue-900 break-all">
                    {{ task.universe.url }}
                  </a>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Discord Webhook</label>
                  <p class="text-gray-900 break-all">{{ task.universe.discordWebhook }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bot Details -->
          <div *ngIf="task.bot" class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold">Bot Details</h2>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p class="text-gray-900">{{ task.bot.name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">UUID</label>
                  <p class="text-gray-900 font-mono text-sm">{{ task.bot.uuid }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': task.bot.status === 'ACTIVE',
                          'bg-gray-100 text-gray-800': task.bot.status === 'INACTIVE'
                        }">
                    {{ task.bot.status }}
                  </span>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Seen</label>
                  <p class="text-gray-900">{{ task.bot.lastSeenAt | date:'medium' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Task Result -->
          <div *ngIf="taskResult" class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold">
                {{ task.status === 'ERROR' ? 'Error Details' : 'Task Result' }}
              </h2>
            </div>
            <div class="card-body">
              <div *ngIf="taskResult.errorMessage" class="mb-4">
                <label class="block text-sm font-medium text-red-700 mb-2">Error Message</label>
                <div class="bg-red-50 border border-red-200 p-4 rounded-md">
                  <p class="text-red-700">{{ taskResult.errorMessage }}</p>
                </div>
              </div>
              
              <div *ngIf="taskResult.fullResult">
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Result</label>
                <pre class="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm max-h-96">{{ formatJson(taskResult.fullResult) }}</pre>
              </div>
              
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Result Created</label>
                <p class="text-gray-900">{{ taskResult.createdAt | date:'medium' }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-4">
            <button 
              (click)="refreshTask()" 
              [disabled]="isLoading"
              class="btn-secondary">
              <span *ngIf="isLoading" class="loading-spinner mr-2"></span>
              Refresh
            </button>
            <button 
              (click)="goBack()" 
              class="btn-primary">
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  taskResult: TaskResult | null = null;
  taskId: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadTask();
  }

  loadTask(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTask(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.loadTaskResult();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load task';
      }
    });
  }

  loadTaskResult(): void {
    if (!this.task) return;

    // Only load result if task is finished or has error
    if (this.task.status === 'FINISHED' || this.task.status === 'ERROR') {
      this.taskService.getTaskResult(this.task.id).subscribe({
        next: (result) => {
          this.taskResult = result;
          this.isLoading = false;
        },
        error: (error) => {
          console.warn('No task result found:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  refreshTask(): void {
    this.loadTask();
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  formatJson(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return jsonString;
    }
  }
}
