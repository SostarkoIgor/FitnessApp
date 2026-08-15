namespace FitnessApp.Server.Dtos
{
    public class RegisterUserResult
    {
        public bool Succeeded { get; private init; }
        public bool IsConflict { get; private init; }
        public string? UserId { get; private init; }
        public IReadOnlyCollection<string> Errors { get; private init; } = Array.Empty<string>();

        public static RegisterUserResult Success(string userId) =>
            new() { Succeeded = true, UserId = userId };

        public static RegisterUserResult Conflict(string error) =>
            new() { Succeeded = false, IsConflict = true, Errors = new[] { error } };

        public static RegisterUserResult Failed(IEnumerable<string> errors) =>
            new() { Succeeded = false, Errors = errors.ToArray() };
    }
}
