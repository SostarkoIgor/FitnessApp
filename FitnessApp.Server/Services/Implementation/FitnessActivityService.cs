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

            if (!string.IsNullOrWhiteSpace(request.UserId) &&
                !await _dbContext.Users.AnyAsync(u => u.Id == request.UserId.Trim()))
            {
                errors.Add(FitnessActivityValidator.UserNotFoundError());
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
                Duration = string.IsNullOrWhiteSpace(request.Duration) ? null : request.Duration.Trim()
            };

            _dbContext.FitnessActivities.Add(activity);
            await _dbContext.SaveChangesAsync();

            return CreateFitnessActivityResult.Success(activity.ToDto());
        }

        public async Task<FitnessActivityDto?> GetByIdAsync(string id)
        {
            var activity = await _dbContext.FitnessActivities
                .Include(a => a.Sport)
                .FirstOrDefaultAsync(a => a.Id == id);

            return activity?.ToDto();
        }

        public async Task<IReadOnlyList<FitnessActivityDto>> GetByUserIdAsync(string userId)
        {
            var activities = await _dbContext.FitnessActivities
                .Include(a => a.Sport)
                .Where(a => a.UserId == userId)
                .ToListAsync();

            return activities
                .OrderByDescending(a => a.Datetime)
                .Select(a => a.ToDto())
                .ToList();
        }
    }
}
