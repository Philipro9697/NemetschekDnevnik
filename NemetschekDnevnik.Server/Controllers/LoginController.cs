using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace NemetschekDnevnik.Server.Controllers
{

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    [ApiController]
    [Route("[controller]")]
    public class LoginController : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] LoginDto request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email and password are required.");
            }

            // TODO: Authenticate user

            return Ok(new { message = "Logged in successfully!" });
        }
    }
}
