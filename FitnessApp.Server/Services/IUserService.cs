using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Services
{
    public interface IUserService
    {
        Task<RegisterUserResult> RegisterAsync(RegisterUserRequest request);

        Task<UserDto?> GetByIdAsync(string id);
    }
}
