using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Services
{
    // Aggregates a user's (optionally sport-filtered) activities into the single ActivityStatsDto
    // shape consumed by both the home dashboard and the per-sport detail view, so day-bucketing,
    // streak, and totals logic lives in exactly one place instead of being re-derived per widget
    // on the client. Day bucketing uses the activity's stored UTC date.
    public static class ActivityStatsCalculator
    {
        private const int CalendarWindowDays = 40;

        public static ActivityStatsDto Calculate(IReadOnlyList<FitnessActivityDto> activities)
        {
            var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.UtcDateTime);

            var pointsByDay = activities
                .GroupBy(a => DateOnly.FromDateTime(a.Datetime.UtcDateTime))
                .ToDictionary(g => g.Key, g => g.Sum(a => a.Points));

            var totalActivities = activities.Count;
            var totalDistance = activities.Sum(a => a.Distance ?? 0m);
            var totalPoints = activities.Sum(a => a.Points);
            var averagePoints = totalActivities > 0 ? (int)Math.Round((double)totalPoints / totalActivities) : 0;
            var bestSessionPoints = activities.Count > 0 ? activities.Max(a => a.Points) : 0;

            var topSport = activities
                .GroupBy(a => a.Sport)
                .Select(g => new { Sport = g.Key, Points = g.Sum(a => a.Points) })
                .OrderByDescending(g => g.Points)
                .FirstOrDefault()
                ?.Sport;

            var bestDay = pointsByDay
                .Select(kv => new DailyPointsDto(kv.Key, kv.Value))
                .OrderByDescending(d => d.Points)
                .FirstOrDefault();

            var currentStreak = CalculateStreak(pointsByDay, today);

            var last7Days = Enumerable.Range(0, 7)
                .Select(offset => today.AddDays(-6 + offset))
                .Select(day => new DailyPointsDto(day, pointsByDay.GetValueOrDefault(day)))
                .ToList();

            var windowStart = today.AddDays(-(CalendarWindowDays - 1));
            var activeDayKeys = pointsByDay.Keys
                .Where(day => day >= windowStart && day <= today)
                .OrderBy(day => day)
                .Select(day => day.ToString("yyyy-MM-dd"))
                .ToList();

            var dailyPointsSeries = pointsByDay
                .OrderBy(kv => kv.Key)
                .Select(kv => new DailyPointsDto(kv.Key, kv.Value))
                .ToList();

            var sportBreakdown = activities
                .GroupBy(a => a.Sport)
                .Select(g => new SportPointsDto(g.Key, g.Sum(a => a.Points)))
                .OrderByDescending(s => s.Points)
                .ToList();

            var recentActivities = activities
                .OrderByDescending(a => a.Datetime)
                .Take(6)
                .ToList();

            return new ActivityStatsDto(
                totalActivities,
                totalDistance,
                totalPoints,
                averagePoints,
                bestSessionPoints,
                topSport,
                bestDay,
                currentStreak,
                last7Days,
                activeDayKeys,
                dailyPointsSeries,
                sportBreakdown,
                recentActivities);
        }

        private static int CalculateStreak(IReadOnlyDictionary<DateOnly, int> pointsByDay, DateOnly today)
        {
            var cursor = today;
            if (!pointsByDay.ContainsKey(cursor))
            {
                cursor = cursor.AddDays(-1);
            }

            var streak = 0;
            while (pointsByDay.ContainsKey(cursor))
            {
                streak++;
                cursor = cursor.AddDays(-1);
            }

            return streak;
        }
    }
}
