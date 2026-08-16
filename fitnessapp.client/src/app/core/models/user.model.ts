export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  points: number;
  rankChange: number;
}

export interface LeaderboardPageDto {
  entries: LeaderboardEntryDto[];
  totalCount: number;
  hasMore: boolean;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
}

export interface RegisterUserResponse {
  id: string;
}
