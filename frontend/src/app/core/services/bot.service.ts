import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bot } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BotService {
  private apiUrl = '/api/bots';

  constructor(private http: HttpClient) {}

  getBots(): Observable<Bot[]> {
    return this.http.get<Bot[]>(this.apiUrl);
  }

  getBot(id: number): Observable<Bot> {
    return this.http.get<Bot>(`${this.apiUrl}/${id}`);
  }
}
