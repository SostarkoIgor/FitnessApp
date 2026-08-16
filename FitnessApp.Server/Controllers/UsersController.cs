using FitnessApp.Server.Dtos;
using FitnessApp.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitnessApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            var result = await _userService.RegisterAsync(request);

            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return CreatedAtAction(nameof(GetById), new { id = result.UserId }, new { id = result.UserId });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user is null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard([FromQuery] int offset = 0, [FromQuery] int limit = 10)
        {
            if (offset < 0 || limit <= 0 || limit > 100)
            {
                return BadRequest();
            }

            var leaderboard = await _userService.GetLeaderboardAsync(offset, limit);
            return Ok(leaderboard);
        }

        [HttpGet("leaderboard/around/{id}")]
        public async Task<IActionResult> GetLeaderboardAroundUser(string id)
        {
            var entries = await _userService.GetLeaderboardAroundUserAsync(id);
            if (entries is null)
            {
                return NotFound();
            }

            return Ok(entries);
        }
    }
}
