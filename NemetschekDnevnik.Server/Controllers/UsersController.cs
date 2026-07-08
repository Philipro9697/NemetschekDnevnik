using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserProfileService _userProfileService;
    public UsersController(IUserProfileService userProfileService)
    {
        _userProfileService = userProfileService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
    {
        var profile = await _userProfileService.GetUserProfileByIdAsync(id);
        if (profile == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(profile);
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult<UserProfileDto>> ApproveUser(int id)
    {
        var profile = await _userProfileService.ApproveAsync(id);
        if (profile == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }
        return Ok(profile);
    }

    [HttpPut("{id}/block")]
    public async Task<ActionResult<UserProfileDto>> BlockUser(int id)
    {
        var profile = await _userProfileService.BlockAsync(id);
        if (profile == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }
        return Ok(profile);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        var deleted = await _userProfileService.DeleteAsync(id);
        return deleted ?
            Ok(new { message = "User deleted successfully." }) :
            NotFound(new { message = "User not found." });
    }

    [HttpGet("pending-approvals")]
    public async Task<ActionResult<IEnumerable<UserProfileDto>>> GetPendingApprovals()
    {
        var pendingUsers = await _userProfileService.GetPendingApprovalsAsync();
        return Ok(pendingUsers);
    }
}
