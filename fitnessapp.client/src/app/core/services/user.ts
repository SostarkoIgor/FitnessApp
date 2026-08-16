import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  LeaderboardEntryDto,
  LeaderboardPageDto,
  RegisterUserRequest,
  RegisterUserResponse,
  UserDto,
} from '../models/user.model';

const USER_ID_STORAGE_KEY = 'userId';

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  register(request: RegisterUserRequest): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>(`${this.baseUrl}/register`, request);
  }

  getById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${id}`);
  }

  getLeaderboard(offset: number, limit: number): Observable<LeaderboardPageDto> {
    return this.http.get<LeaderboardPageDto>(`${this.baseUrl}/leaderboard`, {
      params: { offset, limit },
    });
  }

  getLeaderboardAroundUser(userId: string): Observable<LeaderboardEntryDto[]> {
    return this.http.get<LeaderboardEntryDto[]>(`${this.baseUrl}/leaderboard/around/${userId}`);
  }

  getStoredUserId(): string | null {
    return localStorage.getItem(USER_ID_STORAGE_KEY);
  }

  setStoredUserId(id: string): void {
    localStorage.setItem(USER_ID_STORAGE_KEY, id);
  }

  clearStoredUserId(): void {
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  }
}
