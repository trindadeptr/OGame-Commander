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
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
        <a routerLink="/tasks/create" class="btn-primary">
          Add Task
        </a>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-semibold">Filters</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
              <input 
                type="text" 
                formControlName="playerName" 
                class="input-field" 
                placeholder="Search by player name">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Universe</label>
              <select formControlName="universeId" class="input-field">
                <option value="">All Universes</option>
                <option *ngFor="let universe of universes" [value]="universe.id">
                  {{ universe.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bot</label>
              <select formControlName="botId" class="input-field">
                <option value="">All Bots</option>
                <option *ngFor="let bot of bots" [value]="bot.id">
                  {{ bot.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select formControlName="status" class="input-field">
                <option value="">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FINISHED">Finished</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select formControlName="type" class="input-field">
                <option value="">All Types</option>
                <option value="CHECK_ACTIVITY">Check Activity</option>
                <option value="SPY_PLAYER">Spy Player</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                formControlName="startDate" 
                class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                formControlName="endDate" 
                class="input-field">
            </div>
            
            <div class="flex items-end">
              <button 
                type="button" 
                (click)="clearFilters()" 
                class="btn-secondary w-full">
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <!-- Tasks Table -->
      <div *ngIf="!isLoading" class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Universe
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bot
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let task of tasks" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.playerName || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.universe.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.bot?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ task.createdAt | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a [routerLink]="['/tasks', task.id]" 
                     class="text-blue-600 hover:text-blue-900">
                    View Details
                  </a>
                </td>
              </tr>
              
              <tr *ngIf="tasks.length === 0">
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                  No tasks found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="pageData && pageData.totalPages > 1" 
             class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              (click)="previousPage()" 
              [disabled]="pageData.first"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button 
              (click)="nextPage()" 
              [disabled]="pageData.last"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
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
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {{ pageData.number + 1 }} of {{ pageData.totalPages }}
                </span>
                <button 
                  (click)="nextPage()" 
                  [disabled]="pageData.last"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
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
}
