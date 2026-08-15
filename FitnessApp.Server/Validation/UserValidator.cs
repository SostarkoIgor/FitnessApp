using FitnessApp.Server.Dtos;

namespace FitnessApp.Server.Validation
{
    public static class UserValidator
    {
        public static List<string> ValidateBasicFields(RegisterUserRequest request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                errors.Add("firstName is required.");
            }

            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                errors.Add("lastName is required.");
            }

            return errors;
        }
    }
}
