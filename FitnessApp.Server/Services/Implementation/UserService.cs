using FitnessApp.Server.Data;
using FitnessApp.Server.Dtos;
using FitnessApp.Server.Mappers;
using FitnessApp.Server.Models;
using FitnessApp.Server.Validation;
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
            catch (DbUpdateException)
            {
                // Guards against a race between the AnyAsync check above and the insert.
                return RegisterUserResult.Failed(new[] { "Could not create user." });
            }

            return RegisterUserResult.Success(user.Id);
        }

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
            var query = _dbContext.Users
                .OrderByDescending(u => u.Points)
                .ThenBy(u => u.LastName)
                .ThenBy(u => u.FirstName);

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
            // Only IDs are pulled into memory to locate the user's rank; the full rows for the
            // three-entry window are fetched separately so we never materialize every user's data.
            var orderedIds = await _dbContext.Users
                .OrderByDescending(u => u.Points)
                .ThenBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Select(u => u.Id)
                .ToListAsync();

            var index = orderedIds.IndexOf(userId);
            if (index == -1)
            {
                return null;
            }

            var start = Math.Max(0, index - 1);
            var end = Math.Min(orderedIds.Count - 1, index + 1);
            var idsWindow = orderedIds.Skip(start).Take(end - start + 1).ToList();

            var users = await _dbContext.Users
                .Where(u => idsWindow.Contains(u.Id))
                .ToListAsync();

            return idsWindow
                .Select((id, i) => new { Id = id, Rank = start + i + 1 })
                .Select(x =>
                {
                    var u = users.First(u => u.Id == x.Id);
                    return new LeaderboardEntryDto(x.Rank, u.Id, u.FirstName, u.LastName, u.Points);
                })
                .ToList();
        }
    }
}
