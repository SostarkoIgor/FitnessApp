using FitnessApp.Server.Dtos;
using FitnessApp.Server.Models;

namespace FitnessApp.Server.Mappers
{
    public static class FitnessActivityMapper
    {
        public static FitnessActivityDto ToDto(this FitnessActivity activity) =>
            new(activity.Id, activity.UserId, activity.Datetime, activity.Sport.Name, activity.Steps, activity.Distance, activity.Duration, activity.Points);
    }
}
