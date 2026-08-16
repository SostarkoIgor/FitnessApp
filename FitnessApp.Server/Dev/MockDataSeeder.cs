using FitnessApp.Server.Data;
using FitnessApp.Server.Dtos;
using FitnessApp.Server.Models;
using FitnessApp.Server.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessApp.Server.Dev
{
    // Dev-only mock data generator, triggered via `dotnet run -- seed`. Reuses
    // ActivityScoreCalculator so seeded points stay consistent with real requests.
    public static class MockDataSeeder
    {
        private static readonly string[] FirstNames =
        {
            "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
            "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
            "Thomas", "Sarah", "Charles", "Karen", "Ana", "Marko", "Ivana", "Luka",
            "Petra", "Josip", "Maja", "Tomislav", "Ivan", "Andrea", "Nina", "Filip"
        };

        private static readonly string[] LastNames =
        {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
            "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
            "Horvat", "Novak", "Kovac", "Babic", "Maric", "Peric", "Juric", "Vidic", "Kralj"
        };

        public static async Task SeedAsync(
            AppDbContext dbContext,
            IRankTrackingService rankTrackingService,
            int userCount,
            int minActivitiesPerUser,
            int maxActivitiesPerUser,
            int windowDays = 120)
        {
            var sports = await dbContext.Sports.ToListAsync();
            if (sports.Count == 0)
            {
                throw new InvalidOperationException("No sports found; cannot seed activities.");
            }

            var existingNames = (await dbContext.Users
                .Select(u => u.NormalizedFullName)
                .ToListAsync())
                .ToHashSet();

            var shuffledNamePairs = (
                from firstName in FirstNames
                from lastName in LastNames
                select (firstName, lastName))
                .OrderBy(_ => Random.Shared.Next())
                .ToList();

            var users = new List<User>();
            foreach (var (firstName, lastName) in shuffledNamePairs)
            {
                if (users.Count >= userCount)
                {
                    break;
                }

                var normalizedFullName = $"{firstName.ToUpperInvariant()}|{lastName.ToUpperInvariant()}";
                if (!existingNames.Add(normalizedFullName))
                {
                    continue;
                }

                users.Add(new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    NormalizedFullName = normalizedFullName
                });
            }

            if (users.Count < userCount)
            {
                throw new InvalidOperationException(
                    $"Only found {users.Count} unique name combinations for {userCount} requested users; expand the name pools.");
            }

            // Every seeded user starts tied at 0 points, so their initial Rank is just the
            // same (LastName, FirstName) tie-break the leaderboard itself uses — matching
            // what RankTrackingService/registration would produce for an all-zero population,
            // so the chronological replay below starts from a correct invariant.
            var rankedUsers = users
                .OrderBy(u => u.LastName, StringComparer.Ordinal)
                .ThenBy(u => u.FirstName, StringComparer.Ordinal)
                .ToList();
            for (var i = 0; i < rankedUsers.Count; i++)
            {
                rankedUsers[i].Rank = i + 1;
            }

            dbContext.Users.AddRange(users);
            await dbContext.SaveChangesAsync();

            var windowEnd = DateTimeOffset.UtcNow;
            var windowStart = windowEnd.AddDays(-windowDays);
            var windowSeconds = (windowEnd - windowStart).TotalSeconds;

            var activities = new List<FitnessActivity>();
            foreach (var user in users)
            {
                var activityCount = Random.Shared.Next(minActivitiesPerUser, maxActivitiesPerUser + 1);

                for (var i = 0; i < activityCount; i++)
                {
                    var sport = sports[Random.Shared.Next(sports.Count)];
                    var datetime = windowStart.AddSeconds(Random.Shared.NextDouble() * windowSeconds);

                    var request = new CreateFitnessActivityRequest
                    {
                        UserId = user.Id,
                        Datetime = datetime.ToString("O")
                    };

                    switch (sport.MetricType)
                    {
                        case SportMetricType.Distance:
                            request.Distance = Math.Round((decimal)(Random.Shared.NextDouble() * 24 + 1), 2);
                            break;
                        case SportMetricType.Duration:
                            request.Duration = $"{Random.Shared.Next(10, 91)}:{Random.Shared.Next(0, 60):D2}";
                            break;
                        case SportMetricType.Count:
                            request.Steps = Random.Shared.Next(500, 25000);
                            break;
                    }

                    var points = ActivityScoreCalculator.Calculate(request, sport);

                    activities.Add(new FitnessActivity
                    {
                        UserId = user.Id,
                        Datetime = datetime,
                        SportId = sport.Id,
                        Steps = request.Steps,
                        Distance = request.Distance,
                        Duration = request.Duration,
                        Points = points
                    });
                }
            }

            dbContext.FitnessActivities.AddRange(activities);
            await dbContext.SaveChangesAsync();

            // Points/Rank/RankChangeEvent are not set above — they're derived by replaying
            // every seeded activity through the exact same logic a live submission uses, in
            // the order it actually happened. This is what makes the seeded RankChangeEvent
            // trail a real, internally consistent simulation of the whole window (not
            // fabricated data that could disagree with the seeded totals), and it's the only
            // way "the app has been running for a while" can be true for the new leaderboard
            // trend indicator too.
            foreach (var activity in activities.OrderBy(a => a.Datetime))
            {
                await rankTrackingService.RecordPointsEarnedAsync(dbContext, activity.UserId, activity.Points, activity.Datetime);
            }
        }
    }
}
