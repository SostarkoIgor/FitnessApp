using System.Globalization;
using System.Text.RegularExpressions;
using FitnessApp.Server.Dtos;
using FitnessApp.Server.Models;

namespace FitnessApp.Server.Validation
{
    // Which metric field is required/forbidden is driven by the matched Sport row's
    // MetricType (Distance/Duration/Count), rather than a hardcoded sport list.
    public static class FitnessActivityValidator
    {
        // Internal-only sport row for step counts; not a selectable value on the wire.

        //considering it says sport: "running" | "walking" | "cycling" | "gym" | "swimming" (optional) in task, and the sport is optional,
        //I think we can assume that daily_steps is not a valid sport to be sent in the request, but rather a special case for when steps are provided without a sport.
        public const string DailyStepsSportName = "daily_steps";

        private const string AllowedSportsMessage = "invalid sport entered.";

        private static readonly Regex DurationFormat = new(@"^\d+:[0-5]\d$", RegexOptions.Compiled);

        public static List<string> ValidateBasicFields(CreateFitnessActivityRequest request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.UserId))
            {
                errors.Add("userId is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Datetime) ||
                !DateTimeOffset.TryParse(request.Datetime, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out _))
            {
                errors.Add("datetime is required and must be a valid ISO 8601 date-time string.");
            }

            return errors;
        }

        // Determines which Sport row the request refers to. Sport is optional on the wire:
        // omitting it (with steps supplied) means "daily steps".
        public static (string? SportName, string? Error) ResolveSportName(CreateFitnessActivityRequest request)
        {
            if (!string.IsNullOrWhiteSpace(request.Sport))
            {
                var sportName = request.Sport.Trim().ToLowerInvariant();
                if (sportName == DailyStepsSportName)
                {
                    return (null, AllowedSportsMessage);
                }

                return (sportName, null);
            }

            if (request.Steps.HasValue)
            {
                return (DailyStepsSportName, null);
            }

            return (null, "sport is required, or steps must be provided for a daily step count.");
        }

        public static string UnknownSportError() => AllowedSportsMessage;

        public static string UserNotFoundError() => "user not found.";

        public static List<string> ValidateMetricFields(CreateFitnessActivityRequest request, Sport sport)
        {
            var errors = new List<string>();

            var hasSteps = request.Steps.HasValue;
            var hasDistance = request.Distance.HasValue;
            var hasDuration = !string.IsNullOrWhiteSpace(request.Duration);

            switch (sport.MetricType)
            {
                case SportMetricType.Distance:
                    if (!hasDistance)
                    {
                        errors.Add($"distance is required for sport '{sport.Name}'.");
                    }
                    else if (request.Distance <= 0)
                    {
                        errors.Add("distance must be a positive number.");
                    }

                    if (hasDuration)
                    {
                        errors.Add($"duration must not be provided for sport '{sport.Name}'.");
                    }

                    if (hasSteps)
                    {
                        errors.Add($"steps must not be provided for sport '{sport.Name}'.");
                    }

                    break;

                case SportMetricType.Duration:
                    if (!hasDuration)
                    {
                        errors.Add($"duration is required for sport '{sport.Name}'.");
                    }
                    else if (!DurationFormat.IsMatch(request.Duration!))
                    {
                        errors.Add("duration must be in 'minutes:seconds' format, e.g. '45:30'.");
                    }

                    if (hasDistance)
                    {
                        errors.Add($"distance must not be provided for sport '{sport.Name}'.");
                    }

                    if (hasSteps)
                    {
                        errors.Add($"steps must not be provided for sport '{sport.Name}'.");
                    }

                    break;

                case SportMetricType.Count:
                    if (!hasSteps)
                    {
                        errors.Add("steps is required when sport is not provided.");
                    }
                    else if (request.Steps <= 0)
                    {
                        errors.Add("steps must be a positive integer.");
                    }

                    if (hasDistance)
                    {
                        errors.Add("distance must not be provided when sport is not provided.");
                    }

                    if (hasDuration)
                    {
                        errors.Add("duration must not be provided when sport is not provided.");
                    }

                    break;
            }

            return errors;
        }
    }
}
