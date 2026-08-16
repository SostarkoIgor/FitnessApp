using FitnessApp.Server.Dtos;
using FitnessApp.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitnessApp.Server.Controllers
{
    [ApiController]
    [Route("api/Activities")]
    public class FitnessActivitiesController : ControllerBase
    {
        private readonly IFitnessActivityService _activityService;

        public FitnessActivitiesController(IFitnessActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFitnessActivityRequest request)
        {
            var result = await _activityService.CreateAsync(request);

            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Activity!.Id }, result.Activity);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var activity = await _activityService.GetByIdAsync(id);
            if (activity is null)
            {
                return NotFound();
            }

            return Ok(activity);
        }

        [HttpGet]
        public async Task<IActionResult> GetByUser([FromQuery] string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { errors = new[] { "userId query parameter is required." } });
            }

            var activities = await _activityService.GetByUserIdAsync(userId);
            return Ok(activities);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] string userId, [FromQuery] string? sport = null)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { errors = new[] { "userId query parameter is required." } });
            }

            var stats = await _activityService.GetStatsAsync(userId, sport);
            return Ok(stats);
        }
    }
}
