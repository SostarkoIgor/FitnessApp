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
    }
}
