using FitnessApp.Server.Data;
using FitnessApp.Server.Dtos;
using Microsoft.EntityFrameworkCore;

namespace FitnessApp.Server.Services.Implementation
{
    public class SportService : ISportService
    {
        private readonly AppDbContext _dbContext;

        public SportService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<SportDto>> GetAllAsync()
        {
            var sports = await _dbContext.Sports
                .OrderBy(s => s.Id)
                .ToListAsync();

            return sports
                .Select(s => new SportDto(s.Name, s.MetricType.ToString().ToLowerInvariant()))
                .ToList();
        }
    }
}
