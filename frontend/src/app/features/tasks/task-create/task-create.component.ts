import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { UniverseService } from '../../../core/services/universe.service';
import { Universe, CreateTaskRequest } from '../../../core/models';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center mb-6">
          <button 
            (click)="goBack()" 
            class="mr-4 text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Create New Task</h1>
        </div>

        <div class="card">
          <div class="card-body">
            <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
              <div *ngIf="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {{ errorMessage }}
              </div>

              <div class="grid grid-cols-1 gap-6">
                <!-- Task Type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Task Type *
                  </label>
                  <select formControlName="type" class="input-field">
                    <option value="">Select task type</option>
                    <option value="CHECK_ACTIVITY">Check Activity</option>
                    <option value="SPY_PLAYER">Spy Player</option>
                  </select>
                  <div *ngIf="taskForm.get('type')?.invalid && taskForm.get('type')?.touched" 
                       class="mt-1 text-sm text-red-600">
                    Task type is required
                  </div>
                </div>

                <!-- Universe -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Universe *
                  </label>
                  <select formControlName="universeId" class="input-field">
                    <option value="">Select universe</option>
                    <option *ngFor="let universe of universes" [value]="universe.id">
                      {{ universe.name }}
                    </option>
                  </select>
                  <div *ngIf="taskForm.get('universeId')?.invalid && taskForm.get('universeId')?.touched" 
                       class="mt-1 text-sm text-red-600">
                    Universe is required
                  </div>
                </div>

                <!-- Player Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Player Name
                  </label>
                  <input 
                    type="text" 
                    formControlName="playerName" 
                    class="input-field" 
                    placeholder="Enter player name (optional for CHECK_ACTIVITY)">
                  <p class="mt-1 text-sm text-gray-500">
                    Required for SPY_PLAYER tasks, optional for CHECK_ACTIVITY tasks
                  </p>
                </div>

                <!-- Recurrence -->
                <div>
                  <div class="flex items-center mb-2">
                    <input 
                      id="recurring" 
                      type="checkbox" 
                      formControlName="isRecurring"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <label for="recurring" class="ml-2 block text-sm font-medium text-gray-700">
                      Recurring Task
                    </label>
                  </div>
                  
                  <div *ngIf="taskForm.get('isRecurring')?.value">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recurrence Interval (minutes)
                    </label>
                    <input 
                      type="number" 
                      formControlName="recurrenceMinutes" 
                      class="input-field" 
                      placeholder="e.g., 60 for every hour"
                      min="1">
                    <p class="mt-1 text-sm text-gray-500">
                      How often the task should repeat (minimum 1 minute)
                    </p>
                  </div>
                </div>

                <!-- Task Parameters -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Task Parameters (JSON)
                  </label>
                  <textarea 
                    formControlName="taskParams" 
                    rows="4" 
                    class="input-field" 
                    placeholder='{"example": "value"}'></textarea>
                  <p class="mt-1 text-sm text-gray-500">
                    Optional JSON parameters for the task execution
                  </p>
                  <div *ngIf="taskForm.get('taskParams')?.errors?.['invalidJson']" 
                       class="mt-1 text-sm text-red-600">
                    Invalid JSON format
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  (click)="goBack()" 
                  class="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="taskForm.invalid || isLoading"
                  class="btn-primary">
                  <span *ngIf="isLoading" class="loading-spinner mr-2"></span>
                  {{ isLoading ? 'Creating...' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskCreateComponent implements OnInit {
  taskForm: FormGroup;
  universes: Universe[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private universeService: UniverseService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      type: ['', Validators.required],
      universeId: ['', Validators.required],
      playerName: [''],
      isRecurring: [false],
      recurrenceMinutes: [{ value: '', disabled: true }],
      taskParams: ['', this.jsonValidator]
    });

    // Enable/disable recurrence minutes based on recurring checkbox
    this.taskForm.get('isRecurring')?.valueChanges.subscribe(isRecurring => {
      const recurrenceControl = this.taskForm.get('recurrenceMinutes');
      if (isRecurring) {
        recurrenceControl?.enable();
        recurrenceControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        recurrenceControl?.disable();
        recurrenceControl?.clearValidators();
        recurrenceControl?.setValue('');
      }
      recurrenceControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadUniverses();
  }

  loadUniverses(): void {
    this.universeService.getUniverses().subscribe({
      next: (universes) => {
        this.universes = universes;
      },
      error: (error) => {
        console.error('Error loading universes:', error);
        this.errorMessage = 'Failed to load universes';
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.taskForm.value;
      const task: CreateTaskRequest = {
        type: formValue.type,
        universeId: Number(formValue.universeId),
        playerName: formValue.playerName || undefined,
        recurrenceMinutes: formValue.isRecurring ? Number(formValue.recurrenceMinutes) : undefined,
        taskParams: formValue.taskParams || undefined
      };

      this.taskService.createTask(task).subscribe({
        next: (createdTask) => {
          this.router.navigate(['/tasks', createdTask.id]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create task';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  private jsonValidator(control: any) {
    if (!control.value) {
      return null; // Valid if empty
    }

    try {
      JSON.parse(control.value);
      return null; // Valid JSON
    } catch (error) {
      return { invalidJson: true }; // Invalid JSON
    }
  }
}
