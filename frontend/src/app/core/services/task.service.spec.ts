import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, TaskResult, CreateTaskRequest, TaskFilters, PagedResponse } from '../models';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 1,
    type: 'SPY_PLAYER',
    status: 'CREATED',
    playerName: 'TestPlayer',
    recurrenceMinutes: 60,
    taskParams: '{"key":"value"}',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    universe: {
      id: 1,
      name: 'Test Universe',
      url: 'https://test-universe.com',
      discordWebhook: 'https://discord.com/webhook',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    bot: {
      id: 1,
      uuid: 'test-uuid-123',
      name: 'Test Bot',
      status: 'ACTIVE',
      lastSeenAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      universe: {
        id: 1,
        name: 'Test Universe',
        url: 'https://test-universe.com',
        discordWebhook: 'https://discord.com/webhook',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
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

  const mockCreateTaskRequest: CreateTaskRequest = {
    type: 'SPY_PLAYER',
    playerName: 'TestPlayer',
    universeId: 1,
    recurrenceMinutes: 60,
    taskParams: '{"key":"value"}'
  };

  const mockTaskResult: TaskResult = {
    id: 1,
    task: mockTask,
    fullResult: 'Task completed successfully',
    createdAt: '2023-01-01T01:00:00Z'
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
    it('should get tasks without filters', () => {
      service.getTasks().subscribe(response => {
        expect(response).toEqual(mockPagedResponse);
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedResponse);
    });

    it('should get tasks with filters', () => {
      const filters: TaskFilters = {
        playerName: 'TestPlayer',
        botId: 1,
        universeId: 1,
        status: 'CREATED',
        type: 'SPY_PLAYER',
        page: 0,
        size: 20
      };

      service.getTasks(filters).subscribe(response => {
        expect(response).toEqual(mockPagedResponse);
      });

      const req = httpMock.expectOne(request => {
        return request.url === '/api/tasks' && 
               request.params.get('playerName') === 'TestPlayer' &&
               request.params.get('botId') === '1' &&
               request.params.get('universeId') === '1' &&
               request.params.get('status') === 'CREATED' &&
               request.params.get('type') === 'SPY_PLAYER' &&
               request.params.get('page') === '0' &&
               request.params.get('size') === '20';
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResponse);
    });

    it('should handle getTasks error', () => {
      const errorResponse = { status: 500, statusText: 'Server Error' };

      service.getTasks().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush('Server Error', errorResponse);
    });
  });

  describe('getTask', () => {
    it('should get task by id', () => {
      const taskId = 1;

      service.getTask(taskId).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });

    it('should handle getTask error', () => {
      const taskId = 999;
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getTask(taskId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}`);
      req.flush('Not Found', errorResponse);
    });
  });

  describe('createTask', () => {
    it('should create task', () => {
      service.createTask(mockCreateTaskRequest).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateTaskRequest);
      req.flush(mockTask);
    });

    it('should handle createTask error', () => {
      const errorResponse = { status: 400, statusText: 'Bad Request' };

      service.createTask(mockCreateTaskRequest).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush('Bad Request', errorResponse);
    });
  });

  describe('completeTask', () => {
    it('should complete task', () => {
      const taskId = 1;
      const result = { success: true, data: 'completed' };
      const completedTask = { ...mockTask, status: 'FINISHED' as const };

      service.completeTask(taskId, result).subscribe(task => {
        expect(task).toEqual(completedTask);
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}/complete`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(result);
      req.flush(completedTask);
    });
  });

  describe('getTaskResult', () => {
    it('should get task result', () => {
      const taskId = 1;

      service.getTaskResult(taskId).subscribe(result => {
        expect(result).toEqual(mockTaskResult);
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}/result`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaskResult);
    });

    it('should handle getTaskResult error', () => {
      const taskId = 999;
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getTaskResult(taskId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/tasks/${taskId}/result`);
      req.flush('Not Found', errorResponse);
    });
  });
});
