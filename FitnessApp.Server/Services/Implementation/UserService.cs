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

            _dbContext.Users.Add(user);

            try
            {
                await _dbContext.SaveChangesAsync();
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

            var entries = page
                .Select((u, i) => new LeaderboardEntryDto(offset + i + 1, u.Id, u.FirstName, u.LastName, u.Points))
                .ToList();

            return new LeaderboardPageDto(entries, totalCount, offset + entries.Count < totalCount);
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

            return window
                .Select((u, i) => new LeaderboardEntryDto(start + i, u.Id, u.FirstName, u.LastName, u.Points))
                .ToList();
        }
    }
}
