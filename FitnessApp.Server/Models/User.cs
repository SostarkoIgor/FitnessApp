using System.ComponentModel.DataAnnotations;
namespace FitnessApp.Server.Models
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;

        // Uppercased "FIRSTNAME|LASTNAME" used to enforce case-insensitive uniqueness via a DB index.
        public string NormalizedFullName { get; set; } = string.Empty;

        // Denormalized sum of this user's FitnessActivity.Points, kept in sync on activity creation.

        //I added this, despite a bit of redundancy, to efficiently generate the leaderboard without needing to sum all activities for each user all the time.
        public int Points { get; set; }
    }
}
