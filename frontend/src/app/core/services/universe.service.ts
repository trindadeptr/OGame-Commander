import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Universe, CreateUniverseRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  private apiUrl = `${environment.apiUrl}/universes`;

  constructor(private http: HttpClient) {}

  getUniverses(): Observable<Universe[]> {
    return this.http.get<Universe[]>(this.apiUrl);
  }

  getUniverse(id: number): Observable<Universe> {
    return this.http.get<Universe>(`${this.apiUrl}/${id}`);
  }

  createUniverse(universe: CreateUniverseRequest): Observable<Universe> {
    return this.http.post<Universe>(this.apiUrl, universe);
  }

  updateUniverse(id: number, universe: CreateUniverseRequest): Observable<Universe> {
    return this.http.put<Universe>(`${this.apiUrl}/${id}`, universe);
  }

  deleteUniverse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
