import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task.service';
import { BotService } from '../../../core/services/bot.service';
import { UniverseService } from '../../../core/services/universe.service';
import { Task, Bot, Universe, TaskFilters, PagedResponse } from '../../../core/models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">Task Management</h1>
          <p class="text-gray-400 mt-1">Manage and monitor your OGame automation tasks</p>
        </div>
        <a routerLink="/tasks/create" class="btn-primary">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>Add Task</span>
        </a>
      </div>

      <!-- Filter Controls -->
      <form [formGroup]="filterForm">
        <div class="flex justify-between items-center mb-6">
          <div class="text-gray-400">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select formControlName="status" class="input-field w-40">
              <option value="">All Status</option>
              <option value="CREATED">Created</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FINISHED">Finished</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          
          <div class="text-gray-400">
            <label class="block text-sm font-medium mb-1">Task Type</label>
            <select formControlName="type" class="input-field w-40">
              <option value="">All Types</option>
              <option value="CHECK_ACTIVITY">Check Activity</option>
              <option value="SPY_PLAYER">Spy Player</option>
            </select>
          </div>
          
          <div class="text-gray-400">
            <label class="block text-sm font-medium mb-1">Universe</label>
            <select formControlName="universeId" class="input-field w-40">
              <option value="">All Universes</option>
              <option *ngFor="let universe of universes" [value]="universe.id">
                {{ universe.name }}
              </option>
            </select>
          </div>
          
          <div class="text-gray-400">
            <label class="block text-sm font-medium mb-1">Search</label>
            <input 
              type="text" 
              formControlName="playerName" 
              class="input-field w-64" 
              placeholder="Search tasks...">
          </div>
        </div>
      </form>

      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ getTotalTasks() }}</div>
              <div class="metric-label">Total ListTodo</div>
            </div>
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ getInProgressTasks() }}</div>
              <div class="metric-label">In Progress</div>
            </div>
            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="metric-number">{{ getCompletedTasks() }}</div>
              <div class="metric-label">Completed</div>
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
              <div class="metric-number">{{ getFailedTasks() }}</div>
              <div class="metric-label">Failed</div>
            </div>
            <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <!-- Tasks Content -->
      <div *ngIf="!isLoading && tasks && tasks.length === 0" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-400 mb-2">No tasks found</h3>
          <p class="text-gray-500">Create your first task to get started</p>
        </div>
      </div>
      
      <!-- Tasks Table -->
      <div *ngIf="!isLoading && tasks && tasks.length > 0" class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-600">
            <thead class="bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Player
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Universe
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Bot
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-600">
              <tr *ngFor="let task of tasks" class="hover:bg-gray-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ task.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': task.type === 'CHECK_ACTIVITY',
                          'bg-purple-100 text-purple-800': task.type === 'SPY_PLAYER'
                        }">
                    {{ task.type | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': task.status === 'CREATED',
                          'bg-blue-100 text-blue-800': task.status === 'IN_PROGRESS',
                          'bg-green-100 text-green-800': task.status === 'FINISHED',
                          'bg-red-100 text-red-800': task.status === 'ERROR'
                        }">
                    {{ task.status | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ task.playerName || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ task.universe.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ task.bot?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ task.createdAt | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a [routerLink]="['/tasks', task.id]" 
                     class="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    View Details
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="pageData && pageData.totalPages > 1" 
             class="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-600 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              (click)="previousPage()" 
              [disabled]="pageData.first"
              class="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50">
              Previous
            </button>
            <button 
              (click)="nextPage()" 
              [disabled]="pageData.last"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-400">
                Showing {{ (pageData.number * pageData.size) + 1 }} to 
                {{ Math.min((pageData.number + 1) * pageData.size, pageData.totalElements) }} of 
                {{ pageData.totalElements }} results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button 
                  (click)="previousPage()" 
                  [disabled]="pageData.first"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
                  Previous
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300">
                  Page {{ pageData.number + 1 }} of {{ pageData.totalPages }}
                </span>
                <button 
                  (click)="nextPage()" 
                  [disabled]="pageData.last"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  bots: Bot[] = [];
  universes: Universe[] = [];
  filterForm: FormGroup;
  isLoading = false;
  pageData: PagedResponse<Task> | null = null;
  currentPage = 0;
  pageSize = 20;

  constructor(
    private taskService: TaskService,
    private botService: BotService,
    private universeService: UniverseService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      playerName: [''],
      universeId: [''],
      botId: [''],
      status: [''],
      type: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadUniverses();
    this.loadBots();
    this.loadTasks();
    
    // Watch for filter changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadTasks();
      });
  }

  loadTasks(): void {
    this.isLoading = true;
    const filters: TaskFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      size: this.pageSize
    };

    // Remove empty values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof TaskFilters] === '' || filters[key as keyof TaskFilters] === null) {
        delete filters[key as keyof TaskFilters];
      }
    });

    this.taskService.getTasks(filters).subscribe({
      next: (response) => {
        this.pageData = response;
        this.tasks = response.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  loadBots(): void {
    this.botService.getBots().subscribe({
      next: (bots) => {
        this.bots = bots;
      },
      error: (error) => {
        console.error('Error loading bots:', error);
      }
    });
  }

  loadUniverses(): void {
    this.universeService.getUniverses().subscribe({
      next: (universes) => {
        this.universes = universes;
      },
      error: (error) => {
        console.error('Error loading universes:', error);
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadTasks();
  }

  previousPage(): void {
    if (this.pageData && !this.pageData.first) {
      this.currentPage--;
      this.loadTasks();
    }
  }

  nextPage(): void {
    if (this.pageData && !this.pageData.last) {
      this.currentPage++;
      this.loadTasks();
    }
  }

  // Expose Math for template
  Math = Math;

  // Metric calculation methods
  getTotalTasks(): number {
    return this.pageData?.totalElements || 0;
  }

  getInProgressTasks(): number {
    return this.tasks?.filter(task => task.status === 'IN_PROGRESS').length || 0;
  }

  getCompletedTasks(): number {
    return this.tasks?.filter(task => task.status === 'FINISHED').length || 0;
  }

  getFailedTasks(): number {
    return this.tasks?.filter(task => task.status === 'ERROR').length || 0;
  }
}
