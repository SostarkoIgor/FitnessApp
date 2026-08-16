using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Services
{
    public interface ISportService
    {
        Task<IReadOnlyList<SportDto>> GetAllAsync();
    }
}
