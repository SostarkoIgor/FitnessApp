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
    }
}
