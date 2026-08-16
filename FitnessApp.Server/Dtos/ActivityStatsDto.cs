namespace FitnessApp.Server.Dtos
{
    public record ActivityStatsDto(
        int TotalActivities,
        decimal TotalDistance,
        int TotalPoints,
        int AveragePoints,
        int BestSessionPoints,
        string? TopSport,
        DailyPointsDto? BestDay,
        int CurrentStreak,
        IReadOnlyList<DailyPointsDto> Last7Days,
        IReadOnlyList<string> ActiveDayKeys,
        IReadOnlyList<DailyPointsDto> DailyPointsSeries,
        IReadOnlyList<SportPointsDto> SportBreakdown,
        IReadOnlyList<FitnessActivityDto> RecentActivities);
}
