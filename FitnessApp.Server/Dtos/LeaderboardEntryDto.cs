namespace FitnessApp.Server.Dtos
{
    public record LeaderboardEntryDto(int Rank, string UserId, string FirstName, string LastName, int Points);
}
