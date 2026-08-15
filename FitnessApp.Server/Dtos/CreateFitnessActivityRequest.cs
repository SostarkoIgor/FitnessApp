namespace FitnessApp.Server.Dtos
{
    public class CreateFitnessActivityRequest
    {
        public string UserId { get; set; } = string.Empty;

        public string Datetime { get; set; } = string.Empty;

        public string? Sport { get; set; }

        public int? Steps { get; set; }

        public decimal? Distance { get; set; }

        public string? Duration { get; set; }
    }
}
