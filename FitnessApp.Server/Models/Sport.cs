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
    }
}
