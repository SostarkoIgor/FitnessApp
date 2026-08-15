namespace FitnessApp.Server.Dtos
{
    public class CreateFitnessActivityResult
    {
        public bool Succeeded { get; private init; }
        public FitnessActivityDto? Activity { get; private init; }
        public IReadOnlyCollection<string> Errors { get; private init; } = Array.Empty<string>();

        public static CreateFitnessActivityResult Success(FitnessActivityDto activity) =>
            new() { Succeeded = true, Activity = activity };

        public static CreateFitnessActivityResult Failed(IEnumerable<string> errors) =>
            new() { Succeeded = false, Errors = errors.ToArray() };
    }
}
