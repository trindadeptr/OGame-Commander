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
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Universes</h1>
        <button 
          (click)="showCreateForm = !showCreateForm" 
          class="btn-primary">
          {{ showCreateForm ? 'Cancel' : 'Add Universe' }}
        </button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-semibold">{{ editingUniverse ? 'Edit Universe' : 'Create New Universe' }}</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="universeForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" formControlName="name" class="input-field" placeholder="Universe name">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input type="url" formControlName="url" class="input-field" placeholder="https://...">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Discord Webhook *</label>
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
            <h3 class="text-lg font-semibold">{{ universe.name }}</h3>
          </div>
          <div class="card-body">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <a [href]="universe.url" target="_blank" class="text-blue-600 hover:text-blue-900 text-sm break-all">
                  {{ universe.url }}
                </a>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Discord Webhook</label>
                <p class="text-gray-900 text-sm break-all">{{ universe.discordWebhook }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p class="text-gray-900 text-sm">{{ universe.createdAt | date:'medium' }}</p>
              </div>
            </div>
            <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
              <button (click)="editUniverse(universe)" class="btn-secondary">Edit</button>
              <button (click)="deleteUniverse(universe)" class="btn-danger">Delete</button>
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
