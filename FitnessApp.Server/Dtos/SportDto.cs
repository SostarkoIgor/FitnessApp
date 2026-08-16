namespace FitnessApp.Server.Dtos
{
    // MetricType is lowercased ("distance"/"duration"/"count") rather than serialized as the
    // raw enum, so the frontend can match it directly against its own metric-type strings.
    public record SportDto(string Name, string MetricType);
}
