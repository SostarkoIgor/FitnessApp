using FitnessApp.Server.Data;
using FitnessApp.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessApp.Server.Services.Implementation
{
    // Keeps User.Rank in sync incrementally instead of recomputing the whole leaderboard
    // order on every activity: only the users actually passed get touched, starting the
    // walk from the mover's own stored rank rather than scanning the full table. This is
    // also the single place that emits RankChangeEvent rows, so a live activity submission
    // (FitnessActivityService.CreateAsync) and a seeded one replayed in historical order
    // (MockDataSeeder) share one source of truth for both the resulting Points/Rank state
    // and the change-event trail.
    public class RankTrackingService : IRankTrackingService
    {
        public async Task RecordPointsEarnedAsync(AppDbContext dbContext, string userId, int pointsEarned, DateTimeOffset occurredAt)
        {
            var user = await dbContext.Users.FirstAsync(u => u.Id == userId);

            var oldRank = user.Rank;
            var newPoints = user.Points + pointsEarned;

            if (pointsEarned > 0 && oldRank > 1)
            {
                var candidates = await dbContext.Users
                    .Where(u => u.Rank < oldRank && u.Rank > 0)
                    .OrderByDescending(u => u.Rank)
                    .ToListAsync();

                var passedCount = 0;
                foreach (var candidate in candidates)
                {
                    var moverIsBetter = IsBetterRank(
                        newPoints, user.LastName, user.FirstName,
                        candidate.Points, candidate.LastName, candidate.FirstName);

                    if (!moverIsBetter)
                    {
                        break;
                    }

                    candidate.Rank += 1;
                    dbContext.RankChangeEvents.Add(new RankChangeEvent
                    {
                        UserId = candidate.Id,
                        Delta = -1,
                        OccurredAt = occurredAt,
                    });
                    passedCount++;
                }

                if (passedCount > 0)
                {
                    user.Rank = oldRank - passedCount;
                    dbContext.RankChangeEvents.Add(new RankChangeEvent
                    {
                        UserId = user.Id,
                        Delta = passedCount,
                        OccurredAt = occurredAt,
                    });
                }
            }

            user.Points = newPoints;

            await dbContext.SaveChangesAsync();
        }

        // Mirrors UserQueryExtensions.OrderByLeaderboardRank (points desc, then last/first
        // name — SQLite's default ordinal string comparison, not culture-aware) so a user's
        // maintained Rank can never drift from what that query would actually return.
        private static bool IsBetterRank(
            int points, string lastName, string firstName,
            int otherPoints, string otherLastName, string otherFirstName)
        {
            if (points != otherPoints)
            {
                return points > otherPoints;
            }

            var lastNameComparison = string.CompareOrdinal(lastName, otherLastName);
            if (lastNameComparison != 0)
            {
                return lastNameComparison < 0;
            }

            return string.CompareOrdinal(firstName, otherFirstName) < 0;
        }
    }
}
