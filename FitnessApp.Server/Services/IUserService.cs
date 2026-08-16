using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Services
{
    public interface IUserService
    {
        Task<RegisterUserResult> RegisterAsync(RegisterUserRequest request);

        Task<UserDto?> GetByIdAsync(string id);

        Task<LeaderboardPageDto> GetLeaderboardAsync(int offset, int limit);

        Task<IReadOnlyList<LeaderboardEntryDto>?> GetLeaderboardAroundUserAsync(string userId);
    }
}
