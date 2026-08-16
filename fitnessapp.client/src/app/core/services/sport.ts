import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { SportDto } from '../models/sport.model';

@Service()
export class SportService {
  private readonly http = inject(HttpClient);

  // Sports are static reference data for the lifetime of the app, so the first response
  // is cached and replayed to every caller instead of refetching on every form open.
  private readonly sports$ = this.http.get<SportDto[]>('/api/sports').pipe(shareReplay(1));

  getAll(): Observable<SportDto[]> {
    return this.sports$;
  }
}
