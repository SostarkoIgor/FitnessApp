namespace FitnessApp.Server.Dtos
{
    public record LeaderboardPageDto(IReadOnlyList<LeaderboardEntryDto> Entries, int TotalCount, bool HasMore);
}
