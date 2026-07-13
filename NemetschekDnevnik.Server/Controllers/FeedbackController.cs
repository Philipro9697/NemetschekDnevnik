using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;
using NemetschekDnevnik.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
public class FeedbackController : ControllerBase
{
    public FeedbackController()
    {

    }
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PostFeedback(FeedbackDto feedback)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(new { message = "Thanks for your feedback!" });
    }
}



