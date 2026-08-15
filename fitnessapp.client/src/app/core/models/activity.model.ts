export interface CreateActivityRequest {
  userId: string;
  datetime: string;
  sport?: string;
  steps?: number;
  distance?: number;
  duration?: string;
}

export interface ActivityDto {
  id: string;
  userId: string;
  datetime: string;
  sport: string;
  steps?: number;
  distance?: number;
  duration?: string;
  points: number;
}
