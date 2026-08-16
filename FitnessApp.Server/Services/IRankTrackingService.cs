using FitnessApp.Server.Data;

namespace FitnessApp.Server.Services
{
    public interface IRankTrackingService
    {
        // Applies a points gain to a user, incrementally maintaining User.Rank for every
        // affected row and recording a RankChangeEvent per actual movement. `occurredAt`
        // is the moment the movement should be attributed to — "now" for a live activity
        // submission, or the activity's own historical timestamp when replaying seed data.
        Task RecordPointsEarnedAsync(AppDbContext dbContext, string userId, int pointsEarned, DateTimeOffset occurredAt);
    }
}
