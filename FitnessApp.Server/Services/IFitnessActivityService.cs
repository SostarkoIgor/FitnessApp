using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Services
{
    public interface IFitnessActivityService
    {
        Task<CreateFitnessActivityResult> CreateAsync(CreateFitnessActivityRequest request);

        Task<FitnessActivityDto?> GetByIdAsync(string id);

        Task<ActivityPageDto> GetByUserIdAsync(string userId, int offset, int limit);

        Task<ActivityStatsDto> GetStatsAsync(string userId, string? sport);
    }
}
