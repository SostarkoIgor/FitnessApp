export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
}

export interface LeaderboardEntryDto {
  userId: string;
  firstName: string;
  lastName: string;
  points: number;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
}

export interface RegisterUserResponse {
  id: string;
}
