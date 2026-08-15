namespace FitnessApp.Server.Dtos
{
    public record FitnessActivityDto(
        string Id,
        string UserId,
        DateTimeOffset Datetime,
        string Sport,
        int? Steps,
        decimal? Distance,
        string? Duration,
        int Points);
}
