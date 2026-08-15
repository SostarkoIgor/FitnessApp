import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityDto, CreateActivityRequest } from '../models/activity.model';

@Service()
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/activities';

  create(request: CreateActivityRequest): Observable<ActivityDto> {
    return this.http.post<ActivityDto>(this.baseUrl, request);
  }

  getByUser(userId: string): Observable<ActivityDto[]> {
    return this.http.get<ActivityDto[]>(this.baseUrl, { params: { userId } });
  }
}
