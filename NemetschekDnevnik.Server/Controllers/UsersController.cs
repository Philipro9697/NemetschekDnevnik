using System.Security.Claims;
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
    [Authorize]
    public async Task<ActionResult<UserAccountDto>> GetUserProfile(int id)
    {
        var requesterId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var requesterRole = User.FindFirstValue(ClaimTypes.Role);

        if (requesterRole != "Admin" && requesterId != id)
            return Forbid();

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

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserAccountDto>> CreateUser(CreateUserDto dto)
    {
        var profile = await _adminService.CreateAsync(dto);
        if (profile == null)
            return Conflict(new { message = "Email already registered." });

        return CreatedAtAction(nameof(GetUserProfile), new { id = profile.UserId }, profile);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserAccountDto>> ApproveUser(int id)
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
    public async Task<ActionResult<UserAccountDto>> BlockUser(int id)
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
    public async Task<ActionResult<IEnumerable<UserAccountDto>>> GetPendingApprovals()
    {
        var pendingUsers = await _adminService.GetPendingApprovalsAsync();
        return Ok(pendingUsers);
    }
}