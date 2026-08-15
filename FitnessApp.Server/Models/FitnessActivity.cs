namespace FitnessApp.Server.Models
{
    public class FitnessActivity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string UserId { get; set; } = string.Empty;

        public User User { get; set; } = null!;

        public DateTimeOffset Datetime { get; set; }

        public int SportId { get; set; }

        public Sport Sport { get; set; } = null!;

        public int? Steps { get; set; }

        public decimal? Distance { get; set; }

        // "minutes:seconds", e.g. "45:30".
        public string? Duration { get; set; }

        public int Points { get; set; }
    }
}
