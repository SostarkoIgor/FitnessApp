namespace FitnessApp.Server.Models
{
    public class RankChangeEvent
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string UserId { get; set; } = string.Empty;

        public User User { get; set; } = null!;

        // Positive when this user passed others (magnitude = how many); always -1 when this
        // user was the one passed (a single mover jumping N spots pushes each of the N users
        // it passed down by exactly one, regardless of how far the mover itself jumped).
        public int Delta { get; set; }

        public DateTimeOffset OccurredAt { get; set; }
    }
}
