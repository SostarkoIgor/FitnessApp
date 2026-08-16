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

export interface DailyPointsDto {
  date: string;
  points: number;
}

export interface SportPointsDto {
  sport: string;
  points: number;
}

export interface ActivityPageDto {
  entries: ActivityDto[];
  totalCount: number;
  hasMore: boolean;
}

export interface ActivityStatsDto {
  totalActivities: number;
  totalDistance: number;
  totalPoints: number;
  averagePoints: number;
  bestSessionPoints: number;
  topSport: string | null;
  bestDay: DailyPointsDto | null;
  currentStreak: number;
  last7Days: DailyPointsDto[];
  activeDayKeys: string[];
  dailyPointsSeries: DailyPointsDto[];
  sportBreakdown: SportPointsDto[];
  recentActivities: ActivityDto[];
}
