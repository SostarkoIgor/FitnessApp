using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
namespace FitnessApp.Server.Models
{
    public class User : IdentityUser
    {
        [Required]
        [MinLength(1)]
        public string FirstName { get; set; }
        [Required]
        [MinLength(1)]
        public string LastName { get; set; }

        // Uppercased "FIRSTNAME|LASTNAME" used to enforce case-insensitive uniqueness via a DB index.
        public string NormalizedFullName { get; set; } = string.Empty;
    }
}
