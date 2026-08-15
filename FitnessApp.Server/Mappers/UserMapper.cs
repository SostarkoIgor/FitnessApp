using FitnessApp.Server.Dtos;
using FitnessApp.Server.Models;

namespace FitnessApp.Server.Mappers
{
    public static class UserMapper
    {
        public static UserDto ToDto(this User user) =>
            new(user.Id, user.FirstName, user.LastName);
    }
}
