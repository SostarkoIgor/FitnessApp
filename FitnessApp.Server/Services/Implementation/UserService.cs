using FitnessApp.Server.Dtos;
using FitnessApp.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FitnessApp.Server.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;

        public UserService(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<RegisterUserResult> RegisterAsync(RegisterUserRequest request)
        {
            var firstName = request.FirstName.Trim();
            var lastName = request.LastName.Trim();
            var normalizedFullName = $"{firstName.ToUpperInvariant()}|{lastName.ToUpperInvariant()}";

            var duplicateName = await _userManager.Users
                .AnyAsync(u => u.NormalizedFullName == normalizedFullName);

            if (duplicateName)
            {
                return RegisterUserResult.Conflict("A user with this first and last name already exists.");
            }

            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = firstName,
                LastName = lastName,
                NormalizedFullName = normalizedFullName
            };

            IdentityResult result;
            try
            {
                result = await _userManager.CreateAsync(user, request.Password);
            }
            catch (DbUpdateException)
            {
                // Guards against a race between the AnyAsync check above and the insert.
                return RegisterUserResult.Conflict("A user with this first and last name already exists.");
            }

            if (!result.Succeeded)
            {
                return RegisterUserResult.Failed(result.Errors.Select(e => e.Description));
            }

            return RegisterUserResult.Success(user.Id);
        }

        public async Task<UserDto?> GetByIdAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user is null)
            {
                return null;
            }

            return new UserDto(user.Id, user.FirstName, user.LastName, user.Email ?? string.Empty);
        }
    }
}
