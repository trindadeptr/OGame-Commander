import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, TaskFilters, CreateTaskRequest, PagedResponse } from '../models';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 1,
    type: 'CHECK_ACTIVITY',
    status: 'CREATED',
    playerName: 'TestPlayer',
    parameters: { galaxyRange: '1-5' },
    createdAt: new Date().toISOString(),
    completedAt: null,
    universe: {
      id: 1,
      name: 'Test Universe',
      url: 'https://test.ogame.org',
      discordWebhook: 'https://discord.com/webhook',
      createdAt: new Date().toISOString()
    },
    bot: {
      id: 1,
      name: 'TestBot',
      uuid: 'test-uuid',
      status: 'ACTIVE',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      universeId: 1
    }
  };

  const mockPagedResponse: PagedResponse<Task> = {
    content: [mockTask],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should retrieve tasks without filters', () => {
      service.getTasks().subscribe(response => {
        expect(response).toEqual(mockPagedResponse);
        expect(response.content.length).toBe(1);
        expect(response.content[0]).toEqual(mockTask);
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedResponse);
    });

    it('should retrieve tasks with filters', () => {
      const filters: TaskFilters = {
        status: 'CREATED',
        type: 'CHECK_ACTIVITY',
        universeId: 1,
        page: 0,
        size: 10
      };

      service.getTasks(filters).subscribe(response => {
        expect(response).toEqual(mockPagedResponse);
      });

      const req = httpMock.expectOne(req => req.url === '/api/tasks');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('CREATED');
      expect(req.request.params.get('type')).toBe('CHECK_ACTIVITY');
      expect(req.request.params.get('universeId')).toBe('1');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockPagedResponse);
    });

    it('should handle empty filters', () => {
      const filters: TaskFilters = {};

      service.getTasks(filters).subscribe(response => {
        expect(response).toEqual(mockPagedResponse);
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResponse);
    });
  });

  describe('getTask', () => {
    it('should retrieve a single task by id', () => {
      const taskId = 1;

      service.getTask(taskId).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });

    it('should handle task not found error', () => {
      const taskId = 999;

      service.getTask(taskId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}`);
      req.flush({ error: 'Task not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const createRequest: CreateTaskRequest = {
        type: 'CHECK_ACTIVITY',
        playerName: 'TestPlayer',
        parameters: { galaxyRange: '1-5' },
        universeId: 1
      };

      service.createTask(createRequest).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockTask);
    });

    it('should handle validation errors', () => {
      const invalidRequest: CreateTaskRequest = {
        type: 'CHECK_ACTIVITY',
        playerName: '',
        parameters: {},
        universeId: 1
      };

      service.createTask(invalidRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush({ error: 'Validation error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateTask', () => {
    it('should update a task', () => {
      const taskId = 1;
      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' as const };

      service.updateTask(taskId, updatedTask).subscribe(task => {
        expect(task).toEqual(updatedTask);
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedTask);
      req.flush(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      const taskId = 1;

      service.deleteTask(taskId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('completeTask', () => {
    it('should complete a task with results', () => {
      const taskId = 1;
      const results = { planetsFound: 5, activity: 'high' };
      const completedTask = { ...mockTask, status: 'FINISHED' as const, completedAt: new Date().toISOString() };

      service.completeTask(taskId, results).subscribe(task => {
        expect(task).toEqual(completedTask);
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}/complete`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(results);
      req.flush(completedTask);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      service.getTasks().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('/api/tasks');
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle server errors', () => {
      service.getTasks().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush({ error: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
