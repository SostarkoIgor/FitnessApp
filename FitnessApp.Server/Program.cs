using FitnessApp.Server.Data;
using FitnessApp.Server.Dev;
using FitnessApp.Server.Services;
using FitnessApp.Server.Services.Implementation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("AppDb")));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFitnessActivityService, FitnessActivityService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

if (args.Any(a => string.Equals(a, "seed", StringComparison.OrdinalIgnoreCase)))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await MockDataSeeder.SeedAsync(dbContext, userCount: 40, minActivitiesPerUser: 1, maxActivitiesPerUser: 200);
    return;
}

// For containers/demo environments where there's no separate step to run the app with
// `-- seed` before serving traffic: seed on boot instead, but only into an empty database,
// so it doesn't pile on duplicate mock users if the container restarts against a volume
// that already has data.
if (app.Configuration.GetValue<bool>("SEED_DEMO_DATA"))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!await dbContext.Users.AnyAsync())
    {
        app.Logger.LogInformation("SEED_DEMO_DATA is set and the database is empty; seeding demo data.");
        await MockDataSeeder.SeedAsync(dbContext, userCount: 40, minActivitiesPerUser: 1, maxActivitiesPerUser: 200);
    }
}

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "FitnessApp API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
