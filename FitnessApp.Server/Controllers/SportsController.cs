using FitnessApp.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitnessApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SportsController : ControllerBase
    {
        private readonly ISportService _sportService;

        public SportsController(ISportService sportService)
        {
            _sportService = sportService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sports = await _sportService.GetAllAsync();
            return Ok(sports);
        }
    }
}
