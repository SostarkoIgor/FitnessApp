using FitnessApp.Server.Dtos;
using FitnessApp.Server.Models;

namespace FitnessApp.Server.Services
{
    // Normalizes a logged activity into an integer "Points" value for the leaderboard,
    // using the matched Sport row's MetricType and PointsPerUnit rather than a hardcoded
    // sport list, consistent with FitnessActivityValidator.
    public static class ActivityScoreCalculator
    {
        public static int Calculate(CreateFitnessActivityRequest request, Sport sport)
        {
            return sport.MetricType switch
            {
                // Fractional points are floored, e.g. 1.55km * 50 pts/km = 77.5 -> 77.
                SportMetricType.Distance => (int)Math.Floor(request.Distance!.Value * sport.PointsPerUnit),

                // Duration is stored as "minutes:seconds"; only the whole-minute part counts,
                // e.g. "1:55" -> 1 completed minute.
                SportMetricType.Duration => WholeMinutes(request.Duration!) * (int)sport.PointsPerUnit,

                // Steps are floored to the nearest completed block of 100 before scoring,
                // e.g. 399 steps -> 300 steps -> 3 blocks.
                SportMetricType.Count => (request.Steps!.Value / 100) * (int)sport.PointsPerUnit,

                _ => 0
            };
        }

        private static int WholeMinutes(string duration) =>
            int.Parse(duration.Split(':')[0]);
    }
}
