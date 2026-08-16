using FitnessApp.Server.Data;
using FitnessApp.Server.Dtos;
using FitnessApp.Server.Mappers;
using FitnessApp.Server.Models;
using FitnessApp.Server.Validation;
using Microsoft.EntityFrameworkCore;

namespace FitnessApp.Server.Services.Implementation
{
    public class FitnessActivityService : IFitnessActivityService
    {
        private readonly AppDbContext _dbContext;

        public FitnessActivityService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CreateFitnessActivityResult> CreateAsync(CreateFitnessActivityRequest request)
        {
            var errors = FitnessActivityValidator.ValidateBasicFields(request);

            User? user = null;
            if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                user = await _dbContext.Users.FindAsync(request.UserId.Trim());
                if (user is null)
                {
                    errors.Add(FitnessActivityValidator.UserNotFoundError());
                }
            }

            var (sportName, sportError) = FitnessActivityValidator.ResolveSportName(request);
            if (sportError is not null)
            {
                errors.Add(sportError);
            }

            Sport? sport = null;
            if (sportName is not null)
            {
                sport = await _dbContext.Sports.FirstOrDefaultAsync(s => s.Name == sportName);
                if (sport is null)
                {
                    errors.Add(FitnessActivityValidator.UnknownSportError());
                }
            }

            if (sport is not null)
            {
                errors.AddRange(FitnessActivityValidator.ValidateMetricFields(request, sport));
            }

            if (errors.Count > 0)
            {
                return CreateFitnessActivityResult.Failed(errors);
            }

            var activity = new FitnessActivity
            {
                UserId = request.UserId.Trim(),
                Datetime = DateTimeOffset.Parse(request.Datetime).ToUniversalTime(),
                SportId = sport!.Id,
                Sport = sport,
                Steps = request.Steps,
                Distance = request.Distance,
                Duration = string.IsNullOrWhiteSpace(request.Duration) ? null : request.Duration.Trim(),
                Points = ActivityScoreCalculator.Calculate(request, sport)
            };

            _dbContext.FitnessActivities.Add(activity);

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            await _dbContext.SaveChangesAsync();

            // Atomic UPDATE rather than load-modify-save, so concurrent activity submissions
            // for the same user can't lose an increment to a race on User.Points.
            await _dbContext.Users
                .Where(u => u.Id == activity.UserId)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.Points, u => u.Points + activity.Points));

            await transaction.CommitAsync();

            return CreateFitnessActivityResult.Success(activity.ToDto());
        }

        public async Task<FitnessActivityDto?> GetByIdAsync(string id)
        {
            var activity = await _dbContext.FitnessActivities
                .Include(a => a.Sport)
                .FirstOrDefaultAsync(a => a.Id == id);

            return activity?.ToDto();
        }

        public async Task<ActivityPageDto> GetByUserIdAsync(string userId, int offset, int limit)
        {
            var activities = await _dbContext.FitnessActivities
                .Include(a => a.Sport)
                .Where(a => a.UserId == userId)
                .ToListAsync();

            // Sorted and paged in memory, not via SQL: SQLite can't translate ORDER BY on
            // DateTimeOffset (see GetStatsAsync), so the query above stays unordered.
            var ordered = activities
                .OrderByDescending(a => a.Datetime)
                .ToList();

            var page = ordered
                .Skip(offset)
                .Take(limit)
                .Select(a => a.ToDto())
                .ToList();

            return new ActivityPageDto(page, ordered.Count, offset + page.Count < ordered.Count);
        }

        public async Task<ActivityStatsDto> GetStatsAsync(string userId, string? sport)
        {
            var query = _dbContext.FitnessActivities.Where(a => a.UserId == userId);

            if (!string.IsNullOrWhiteSpace(sport))
            {
                query = query.Where(a => a.Sport.Name == sport);
            }

            // Sorting by Datetime (DateTimeOffset) isn't done in the query itself: SQLite can't
            // translate ORDER BY on that type, so it stays unordered here and gets sorted where
            // needed (e.g. RecentActivities) after materializing, same as GetByUserIdAsync above.
            var activities = await query
                .Select(a => new FitnessActivityDto(a.Id, a.UserId, a.Datetime, a.Sport.Name, a.Steps, a.Distance, a.Duration, a.Points))
                .ToListAsync();

            return ActivityStatsCalculator.Calculate(activities);
        }
    }
}
