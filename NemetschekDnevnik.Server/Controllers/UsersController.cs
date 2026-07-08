using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IAdminService _adminService;
    public UsersController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
    {
        var profile = await _adminService.GetUserProfileByIdAsync(id);
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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserProfileDto>> ApproveUser(int id)
    {
        var profile = await _adminService.ApproveAsync(id);
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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserProfileDto>> BlockUser(int id)
    {
        var profile = await _adminService.BlockAsync(id);
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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        var deleted = await _adminService.DeleteAsync(id);
        return deleted ? 
            Ok(new { message = "User deleted successfully." }) : 
            NotFound(new {message = "User not found."});
    }

    [HttpGet("pending-approvals")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserProfileDto>>> GetPendingApprovals()
    {
        var pendingUsers = await _adminService.GetPendingApprovalsAsync();
        return Ok(pendingUsers);
    }
}