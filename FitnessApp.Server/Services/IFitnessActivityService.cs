using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Services
{
    public interface IFitnessActivityService
    {
        Task<CreateFitnessActivityResult> CreateAsync(CreateFitnessActivityRequest request);

        Task<FitnessActivityDto?> GetByIdAsync(string id);

        Task<IReadOnlyList<FitnessActivityDto>> GetByUserIdAsync(string userId);

        Task<ActivityStatsDto> GetStatsAsync(string userId, string? sport);
    }
}
