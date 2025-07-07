import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UniverseService } from '../../../core/services/universe.service';
import { Universe, CreateUniverseRequest } from '../../../core/models';

@Component({
  selector: 'app-universe-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">Universe Management</h1>
          <p class="text-gray-400 mt-1">Configure OGame universes and their settings</p>
        </div>
        <button 
          (click)="showCreateForm = !showCreateForm" 
          class="btn-primary">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>{{ showCreateForm ? 'Cancel' : 'Add Universe' }}</span>
        </button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-white">{{ editingUniverse ? 'Edit Universe' : 'Create New Universe' }}</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="universeForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                <input type="text" formControlName="name" class="input-field" placeholder="Universe name">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">URL *</label>
                <input type="url" formControlName="url" class="input-field" placeholder="https://...">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Discord Webhook *</label>
                <input type="url" formControlName="discordWebhook" class="input-field" placeholder="Discord webhook URL">
              </div>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
              <button type="button" (click)="cancelEdit()" class="btn-secondary">Cancel</button>
              <button type="submit" [disabled]="universeForm.invalid || isLoading" class="btn-primary">
                {{ isLoading ? 'Saving...' : (editingUniverse ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Universe List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let universe of universes" class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">{{ universe.name }}</h3>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-400">Active</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Discord Webhook</label>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-gray-300 text-sm">Configured</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">URL</label>
                <p class="text-gray-300 text-sm break-all">{{ universe.url }}</p>
              </div>
            </div>
            <div class="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-600">
              <button (click)="editUniverse(universe)" class="px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="m18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              <button (click)="deleteUniverse(universe)" class="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UniverseListComponent implements OnInit {
  universes: Universe[] = [];
  universeForm: FormGroup;
  showCreateForm = false;
  editingUniverse: Universe | null = null;
  isLoading = false;

  constructor(
    private universeService: UniverseService,
    private fb: FormBuilder
  ) {
    this.universeForm = this.fb.group({
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      discordWebhook: ['', [Validators.required, Validators.pattern(/^https:\/\/discord(app)?\.com\/api\/webhooks\/.+/)]]
    });
  }

  ngOnInit(): void {
    this.loadUniverses();
  }

  loadUniverses(): void {
    this.universeService.getUniverses().subscribe({
      next: (universes) => this.universes = universes,
      error: (error) => console.error('Error loading universes:', error)
    });
  }

  onSubmit(): void {
    if (this.universeForm.valid) {
      this.isLoading = true;
      const request: CreateUniverseRequest = this.universeForm.value;
      
      if (this.editingUniverse) {
        this.universeService.updateUniverse(this.editingUniverse.id, request).subscribe({
          next: () => { this.loadUniverses(); this.cancelEdit(); },
          error: () => this.isLoading = false,
          complete: () => this.isLoading = false
        });
      } else {
        this.universeService.createUniverse(request).subscribe({
          next: () => { this.loadUniverses(); this.cancelEdit(); },
          error: () => this.isLoading = false,
          complete: () => this.isLoading = false
        });
      }
    }
  }

  editUniverse(universe: Universe): void {
    this.editingUniverse = universe;
    this.universeForm.patchValue(universe);
    this.showCreateForm = true;
  }

  deleteUniverse(universe: Universe): void {
    if (confirm(`Are you sure you want to delete "${universe.name}"?`)) {
      this.universeService.deleteUniverse(universe.id).subscribe({
        next: () => this.loadUniverses(),
        error: (error) => console.error('Error deleting universe:', error)
      });
    }
  }

  cancelEdit(): void {
    this.showCreateForm = false;
    this.editingUniverse = null;
    this.universeForm.reset();
  }
}
