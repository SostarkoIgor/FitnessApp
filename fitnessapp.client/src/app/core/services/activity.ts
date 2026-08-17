import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityDto, ActivityPageDto, ActivityStatsDto, CreateActivityRequest } from '../models/activity.model';

@Service()
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/activities'; //for simplicity i decided to hardcode routes like this, but ofc i know this in not the approach in real project

  create(request: CreateActivityRequest): Observable<ActivityDto> {
    return this.http.post<ActivityDto>(this.baseUrl, request);
  }

  getByUser(userId: string, offset: number, limit: number): Observable<ActivityPageDto> {
    return this.http.get<ActivityPageDto>(this.baseUrl, { params: { userId, offset, limit } });
  }

  getStats(userId: string, sport?: string): Observable<ActivityStatsDto> {
    const params: Record<string, string> = sport ? { userId, sport } : { userId };
    return this.http.get<ActivityStatsDto>(`${this.baseUrl}/stats`, { params });
  }
}
