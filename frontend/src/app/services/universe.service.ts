import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Universe {
  id?: string;
  url: string;
  discordWebhook?: string;
}

@Injectable({ providedIn: 'root' })
export class UniverseService {
  constructor(private http: HttpClient) {}

  list(): Observable<Universe[]> {
    return this.http.get<Universe[]>('/api/universes');
  }

  save(u: Universe): Observable<Universe> {
    return u.id ? this.http.put<Universe>(`/api/universes/${u.id}`, u) : this.http.post<Universe>('/api/universes', u);
  }
}
