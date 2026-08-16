using FitnessApp.Server.Models;

namespace FitnessApp.Server.Data
{
    public static class UserQueryExtensions
    {
        // Canonical leaderboard ordering: highest points first, ties broken alphabetically.
        // Shared so the ranked page and the "around user" lookup can never drift apart.
        public static IOrderedQueryable<User> OrderByLeaderboardRank(this IQueryable<User> users) =>
            users
                .OrderByDescending(u => u.Points)
                .ThenBy(u => u.LastName)
                .ThenBy(u => u.FirstName);
    }
}
