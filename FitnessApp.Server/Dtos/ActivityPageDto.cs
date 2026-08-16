namespace FitnessApp.Server.Dtos
{
    public record ActivityPageDto(IReadOnlyList<FitnessActivityDto> Entries, int TotalCount, bool HasMore);
}
