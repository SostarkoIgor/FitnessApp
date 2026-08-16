using FitnessApp.Server.Data;
using FitnessApp.Server.Dtos;
using FitnessApp.Server.Mappers;
using FitnessApp.Server.Models;
using FitnessApp.Server.Validation;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace FitnessApp.Server.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _dbContext;

        // How far back LeaderboardEntryDto.RankChange looks — see GetRankChangesAsync.
        private const int RankChangeWindowDays = 15;

        public UserService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RegisterUserResult> RegisterAsync(RegisterUserRequest request)
        {
            var errors = UserValidator.ValidateBasicFields(request);
            if (errors.Count > 0)
            {
                return RegisterUserResult.Failed(errors);
            }

            var firstName = request.FirstName.Trim();
            var lastName = request.LastName.Trim();
            var normalizedFullName = $"{firstName.ToUpperInvariant()}|{lastName.ToUpperInvariant()}";

            var duplicateName = await _dbContext.Users
                .AnyAsync(u => u.NormalizedFullName == normalizedFullName);

            if (duplicateName)
            {
                return RegisterUserResult.Failed(new[] { "Could not create user." });
            }

            var user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                NormalizedFullName = normalizedFullName
            };

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // A new user starts at 0 points, tied with any other 0-point users and
                // ordered among them the same way the leaderboard breaks ties (by name) — so
                // Rank has to be computed once here (mirrors RankTrackingService's ordering)
                // rather than left at its default, and everyone who now ranks numerically
                // worse shifts down by one to make room. Runs before the insert so the
                // shift's Where clause only matches pre-existing users.
                var betterCount = await _dbContext.Users.CountAsync(u =>
                    u.Points > 0 ||
                    (u.Points == 0 && string.Compare(u.LastName, lastName) < 0) ||
                    (u.Points == 0 && u.LastName == lastName && string.Compare(u.FirstName, firstName) < 0));
                user.Rank = betterCount + 1;

                await _dbContext.Users
                    .Where(u => u.Rank >= user.Rank)
                    .ExecuteUpdateAsync(s => s.SetProperty(u => u.Rank, u => u.Rank + 1));

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueNameViolation(ex))
            {
                // Guards against a race between the AnyAsync check above and the insert.
                return RegisterUserResult.Failed(new[] { "Could not create user." });
            }

            return RegisterUserResult.Success(user.Id);
        }

        // SQLITE_CONSTRAINT (19) covers all constraint violations, not just the unique-name
        // index this guards against, but NormalizedFullName is the only constraint this
        // insert can hit, so it's an unambiguous signal here.
        private static bool IsUniqueNameViolation(DbUpdateException ex) =>
            ex.InnerException is SqliteException { SqliteErrorCode: 19 };

        public async Task<UserDto?> GetByIdAsync(string id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user is null)
            {
                return null;
            }

            return user.ToDto();
        }

        public async Task<LeaderboardPageDto> GetLeaderboardAsync(int offset, int limit)
        {
            var query = _dbContext.Users.OrderByLeaderboardRank();

            var totalCount = await query.CountAsync();

            var page = await query
                .Skip(offset)
                .Take(limit)
                .ToListAsync();

            var rankChanges = await GetRankChangesAsync(page.Select(u => u.Id).ToList());

            var entries = page
                .Select((u, i) => new LeaderboardEntryDto(
                    offset + i + 1, u.Id, u.FirstName, u.LastName, u.Points, rankChanges.GetValueOrDefault(u.Id)))
                .ToList();

            return new LeaderboardPageDto(entries, totalCount, offset + entries.Count < totalCount);
        }

        // Net sum of RankChangeEvent.Delta per user over the trailing window — see LeaderboardEntryDto.
        // The OccurredAt (DateTimeOffset) filter and the GroupBy both stay client-side rather
        // than in SQL: SQLite can't translate a DateTimeOffset comparison combined with the
        // Contains predicate here (same family of limitation as GetStatsAsync's ORDER BY
        // note), and events per requested user are few enough that fetching by id alone and
        // filtering/grouping in memory is cheap.
        private async Task<Dictionary<string, int>> GetRankChangesAsync(List<string> userIds)
        {
            var since = DateTimeOffset.UtcNow.AddDays(-RankChangeWindowDays);

            var events = await _dbContext.RankChangeEvents
                .Where(e => userIds.Contains(e.UserId))
                .ToListAsync();

            return events
                .Where(e => e.OccurredAt >= since)
                .GroupBy(e => e.UserId)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Delta));
        }

        public async Task<IReadOnlyList<LeaderboardEntryDto>?> GetLeaderboardAroundUserAsync(string userId)
        {
            var target = await _dbContext.Users.FindAsync(userId);
            if (target is null)
            {
                return null;
            }

            // Rank = 1 + how many users sort ahead of the target under the same
            // Points desc / LastName / FirstName order used by the leaderboard page.
            // Computed in the database via COUNT instead of loading every user to find
            // the target's position, so this stays cheap as the user base grows.
            var betterCount = await _dbContext.Users.CountAsync(u =>
                u.Points > target.Points ||
                (u.Points == target.Points && string.Compare(u.LastName, target.LastName) < 0) ||
                (u.Points == target.Points && u.LastName == target.LastName &&
                    string.Compare(u.FirstName, target.FirstName) < 0));

            var rank = betterCount + 1;
            var start = Math.Max(1, rank - 1);
            var take = rank - start + 2;

            var window = await _dbContext.Users
                .OrderByLeaderboardRank()
                .Skip(start - 1)
                .Take(take)
                .ToListAsync();

            var rankChanges = await GetRankChangesAsync(window.Select(u => u.Id).ToList());

            return window
                .Select((u, i) => new LeaderboardEntryDto(
                    start + i, u.Id, u.FirstName, u.LastName, u.Points, rankChanges.GetValueOrDefault(u.Id)))
                .ToList();
        }
    }
}
