using FitnessApp.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace FitnessApp.Server.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        public DbSet<FitnessActivity> FitnessActivities => Set<FitnessActivity>();

        public DbSet<Sport> Sports => Set<Sport>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
                .HasIndex(u => u.NormalizedFullName)
                .IsUnique();

            builder.Entity<FitnessActivity>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Sport>()
                .HasIndex(s => s.Name)
                .IsUnique();

            builder.Entity<Sport>().HasData(
                new Sport { Id = 1, Name = "running", MetricType = SportMetricType.Distance },
                new Sport { Id = 2, Name = "walking", MetricType = SportMetricType.Distance },
                new Sport { Id = 3, Name = "cycling", MetricType = SportMetricType.Distance },
                new Sport { Id = 4, Name = "gym", MetricType = SportMetricType.Duration },
                new Sport { Id = 5, Name = "swimming", MetricType = SportMetricType.Duration },
                new Sport { Id = 6, Name = "daily_steps", MetricType = SportMetricType.Count }
            );
        }
    }
}
