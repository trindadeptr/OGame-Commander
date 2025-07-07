import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskResult, CreateTaskRequest, TaskFilters, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(filters?: TaskFilters): Observable<PagedResponse<Task>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.playerName) params = params.set('playerName', filters.playerName);
      if (filters.botId) params = params.set('botId', filters.botId.toString());
      if (filters.universeId) params = params.set('universeId', filters.universeId.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    }

    return this.http.get<PagedResponse<Task>>(this.apiUrl, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  completeTask(id: number, result: any): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}/complete`, result);
  }

  getTaskResult(taskId: number): Observable<TaskResult> {
    return this.http.get<TaskResult>(`${this.apiUrl}/${taskId}/result`);
  }
}
