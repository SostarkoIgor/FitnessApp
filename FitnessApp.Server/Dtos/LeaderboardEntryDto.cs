namespace FitnessApp.Server.Dtos
{
    // RankChange is the net sum of RankChangeEvent.Delta for this user over the trailing
    // window (see UserService.RankChangeWindowDays): positive means they climbed that many
    // spots, negative means they were passed that many times net, 0 means no movement (or
    // none recorded yet).
    public record LeaderboardEntryDto(int Rank, string UserId, string FirstName, string LastName, int Points, int RankChange);
}
