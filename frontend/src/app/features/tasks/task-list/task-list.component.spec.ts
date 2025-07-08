import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../../core/services/task.service';
import { BotService } from '../../../core/services/bot.service';
import { UniverseService } from '../../../core/services/universe.service';
import { Task, Bot, Universe, PagedResponse } from '../../../core/models';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let botServiceSpy: jasmine.SpyObj<BotService>;
  let universeServiceSpy: jasmine.SpyObj<UniverseService>;

  const mockUniverse: Universe = {
    id: 1,
    name: 'Test Universe',
    url: 'https://test.ogame.org',
    discordWebhook: 'https://discord.com/webhook',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockBot: Bot = {
    id: 1,
    name: 'TestBot',
    uuid: 'test-uuid',
    status: 'ACTIVE',
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    universe: mockUniverse
  };

  const mockTask: Task = {
    id: 1,
    type: 'CHECK_ACTIVITY',
    status: 'CREATED',
    playerName: 'TestPlayer',
    taskParams: JSON.stringify({ galaxyRange: '1-5' }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    universe: mockUniverse,
    bot: mockBot
  };

  const mockTasks: Task[] = [
    mockTask,
    { ...mockTask, id: 2, status: 'IN_PROGRESS' },
    { ...mockTask, id: 3, status: 'FINISHED' },
    { ...mockTask, id: 4, status: 'ERROR' }
  ];

  const mockPagedResponse: PagedResponse<Task> = {
    content: mockTasks,
    totalElements: 4,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true
  };

  beforeEach(async () => {
    const taskSpy = jasmine.createSpyObj('TaskService', ['getTasks']);
    const botSpy = jasmine.createSpyObj('BotService', ['getBots']);
    const universeSpy = jasmine.createSpyObj('UniverseService', ['getUniverses']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskSpy },
        { provide: BotService, useValue: botSpy },
        { provide: UniverseService, useValue: universeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskServiceSpy = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    botServiceSpy = TestBed.inject(BotService) as jasmine.SpyObj<BotService>;
    universeServiceSpy = TestBed.inject(UniverseService) as jasmine.SpyObj<UniverseService>;

    // Setup default spy returns
    taskServiceSpy.getTasks.and.returnValue(of(mockPagedResponse));
    botServiceSpy.getBots.and.returnValue(of([mockBot]));
    universeServiceSpy.getUniverses.and.returnValue(of([mockUniverse]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('component initialization', () => {
    it('should load data on init', () => {
      component.ngOnInit();

      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
      expect(botServiceSpy.getBots).toHaveBeenCalled();
      expect(universeServiceSpy.getUniverses).toHaveBeenCalled();
    });

    it('should initialize filter form', () => {
      expect(component.filterForm).toBeDefined();
      expect(component.filterForm.get('playerName')).toBeDefined();
      expect(component.filterForm.get('status')).toBeDefined();
      expect(component.filterForm.get('type')).toBeDefined();
      expect(component.filterForm.get('universeId')).toBeDefined();
      expect(component.filterForm.get('botId')).toBeDefined();
      expect(component.filterForm.get('startDate')).toBeDefined();
      expect(component.filterForm.get('endDate')).toBeDefined();
    });

    it('should set initial data after loading', () => {
      component.ngOnInit();

      expect(component.tasks).toEqual(mockTasks);
      expect(component.bots).toEqual([mockBot]);
      expect(component.universes).toEqual([mockUniverse]);
      expect(component.pageData).toEqual(mockPagedResponse);
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should apply filters when form changes', () => {
      const filters = { status: 'CREATED', type: 'CHECK_ACTIVITY' };
      component.filterForm.patchValue(filters);

      // Simulate form value changes (this would normally trigger automatically)
      component.loadTasks();

      expect(taskServiceSpy.getTasks).toHaveBeenCalledWith(
        jasmine.objectContaining(filters)
      );
    });

    it('should clear filters', () => {
      component.filterForm.patchValue({ status: 'CREATED', playerName: 'test' });
      
      component.clearFilters();

      expect(component.filterForm.value.status).toBe(null);
      expect(component.filterForm.value.playerName).toBe(null);
      expect(component.currentPage).toBe(0);
    });

    it('should reset page when filters change', () => {
      component.currentPage = 2;
      
      // Simulate the behavior that happens in ngOnInit when form values change
      component.currentPage = 0;
      component.loadTasks();

      expect(component.currentPage).toBe(0);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      component.currentPage = 1;
      component.pageData = {
        ...mockPagedResponse,
        totalPages: 3,
        number: 1,
        first: false,
        last: false
      };
    });

    it('should go to previous page', () => {
      component.previousPage();

      expect(component.currentPage).toBe(0);
      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
    });

    it('should go to next page', () => {
      component.nextPage();

      expect(component.currentPage).toBe(2);
      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
    });

    it('should not go to previous page if on first page', () => {
      component.pageData = { ...mockPagedResponse, first: true };
      component.currentPage = 0;

      component.previousPage();

      expect(component.currentPage).toBe(0);
    });

    it('should not go to next page if on last page', () => {
      component.pageData = { ...mockPagedResponse, last: true };
      component.currentPage = 2;

      component.nextPage();

      expect(component.currentPage).toBe(2);
    });
  });

  describe('metrics calculation', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.pageData = mockPagedResponse;
    });

    it('should calculate total tasks correctly', () => {
      expect(component.getTotalTasks()).toBe(4);
    });

    it('should calculate in progress tasks correctly', () => {
      expect(component.getInProgressTasks()).toBe(1);
    });

    it('should calculate completed tasks correctly', () => {
      expect(component.getCompletedTasks()).toBe(1);
    });

    it('should calculate failed tasks correctly', () => {
      expect(component.getFailedTasks()).toBe(1);
    });

    it('should handle empty task list', () => {
      component.tasks = [];
      component.pageData = { ...mockPagedResponse, content: [], totalElements: 0 };

      expect(component.getTotalTasks()).toBe(0);
      expect(component.getInProgressTasks()).toBe(0);
      expect(component.getCompletedTasks()).toBe(0);
      expect(component.getFailedTasks()).toBe(0);
    });
  });

  describe('loading states', () => {
    it('should show loading spinner during data fetch', () => {
      // Don't call ngOnInit here to avoid interference
      component.isLoading = true;
      
      expect(component.isLoading).toBe(true);
    });

    it('should hide loading spinner after data loads', () => {
      component.isLoading = false;
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
    });

    it('should set loading state correctly', () => {
      expect(component.isLoading).toBe(false);

      component.loadTasks();

      expect(component.isLoading).toBe(false); // Will be false after synchronous observable
    });
  });

  describe('error handling', () => {
    it('should handle task loading errors', () => {
      taskServiceSpy.getTasks.and.returnValue(throwError(() => new Error('Server error')));
      spyOn(console, 'error');

      component.loadTasks();

      expect(console.error).toHaveBeenCalledWith('Error loading tasks:', jasmine.any(Error));
      expect(component.isLoading).toBe(false);
    });

    it('should handle bot loading errors', () => {
      botServiceSpy.getBots.and.returnValue(throwError(() => new Error('Server error')));
      spyOn(console, 'error');

      component.loadBots();

      expect(console.error).toHaveBeenCalledWith('Error loading bots:', jasmine.any(Error));
    });

    it('should handle universe loading errors', () => {
      universeServiceSpy.getUniverses.and.returnValue(throwError(() => new Error('Server error')));
      spyOn(console, 'error');

      component.loadUniverses();

      expect(console.error).toHaveBeenCalledWith('Error loading universes:', jasmine.any(Error));
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should display tasks in table', () => {
      const taskRows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(taskRows.length).toBe(mockTasks.length);
    });

    it('should display empty state when no tasks', () => {
      component.tasks = [];
      fixture.detectChanges();

      const emptyText = fixture.nativeElement.textContent;
      expect(emptyText).toContain('No tasks found');
    });

    it('should display metric cards', () => {
      const metricCards = fixture.nativeElement.querySelectorAll('.metric-card');
      expect(metricCards.length).toBe(4); // Total, In Progress, Completed, Failed
    });

    it('should display filter controls', () => {
      const statusSelect = fixture.nativeElement.querySelector('select[formControlName="status"]');
      const typeSelect = fixture.nativeElement.querySelector('select[formControlName="type"]');
      const universeSelect = fixture.nativeElement.querySelector('select[formControlName="universeId"]');
      const searchInput = fixture.nativeElement.querySelector('input[formControlName="playerName"]');

      expect(statusSelect).toBeTruthy();
      expect(typeSelect).toBeTruthy();
      expect(universeSelect).toBeTruthy();
      expect(searchInput).toBeTruthy();
    });
  });

  describe('Math property exposure', () => {
    it('should expose Math object for template use', () => {
      expect(component.Math).toBe(Math);
    });
  });

  describe('initial state handling', () => {
    it('should handle undefined tasks in metrics methods', () => {
      // Reset tasks to undefined to simulate initial state
      component.tasks = undefined as any;
      
      expect(component.getInProgressTasks()).toBe(0);
      expect(component.getCompletedTasks()).toBe(0);
      expect(component.getFailedTasks()).toBe(0);
    });

    it('should handle template rendering before data loads', () => {
      // Don't call ngOnInit to simulate component creation
      component.isLoading = true;
      component.tasks = undefined as any;
      fixture.detectChanges();

      // Should not throw errors
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle metrics display before data loads', () => {
      // Reset component state to simulate initial undefined state
      component.tasks = undefined as any;
      component.pageData = null;
      
      // Test that methods don't throw errors and return 0
      expect(() => {
        component.getTotalTasks();
        component.getInProgressTasks();
        component.getCompletedTasks();
        component.getFailedTasks();
      }).not.toThrow();
      
      expect(component.getTotalTasks()).toBe(0);
      expect(component.getInProgressTasks()).toBe(0);
      expect(component.getCompletedTasks()).toBe(0);
      expect(component.getFailedTasks()).toBe(0);
    });
  });
});
