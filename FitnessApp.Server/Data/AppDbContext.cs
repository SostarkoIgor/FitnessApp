using FitnessApp.Server.Models;
using Microsoft.EntityFrameworkCore;
namespace FitnessApp.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();

        public DbSet<FitnessActivity> FitnessActivities => Set<FitnessActivity>();

        public DbSet<Sport> Sports => Set<Sport>();

        public DbSet<RankChangeEvent> RankChangeEvents => Set<RankChangeEvent>();

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

            builder.Entity<RankChangeEvent>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RankChangeEvent>()
                .HasIndex(e => new { e.UserId, e.OccurredAt });

            builder.Entity<Sport>().HasData(
                new Sport { Id = 1, Name = "running", MetricType = SportMetricType.Distance, PointsPerUnit = 100m },
                new Sport { Id = 2, Name = "walking", MetricType = SportMetricType.Distance, PointsPerUnit = 50m },
                new Sport { Id = 3, Name = "cycling", MetricType = SportMetricType.Distance, PointsPerUnit = 25m },
                new Sport { Id = 4, Name = "gym", MetricType = SportMetricType.Duration, PointsPerUnit = 5m },
                new Sport { Id = 5, Name = "swimming", MetricType = SportMetricType.Duration, PointsPerUnit = 15m },
                new Sport { Id = 6, Name = "daily_steps", MetricType = SportMetricType.Count, PointsPerUnit = 1m }
            );
        }
    }
}
