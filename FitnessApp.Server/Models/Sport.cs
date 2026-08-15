using System.ComponentModel.DataAnnotations;
namespace FitnessApp.Server.Models
{
    public enum SportMetricType
    {
        Distance,
        Duration,
        Count
    }

    public class Sport
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public SportMetricType MetricType { get; set; }

        // Points awarded per unit: per km (Distance), per completed minute (Duration),
        // or per completed block of 100 steps (Count).
        public decimal PointsPerUnit { get; set; }
    }
}
