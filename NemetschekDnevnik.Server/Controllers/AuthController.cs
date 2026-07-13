using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;
using NemetschekDnevnik.Server.Services;
using Superpower.Model;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto.Email, dto.Password);
        if (token is null)
            return Unauthorized(new { message = "Invalid credentials or account not approved" });

        SetRefreshTokenCookie(token.RefreshToken);

        return Ok(new { token });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "Refresh token is missing" });

        var result = await _authService.RefreshAsync(refreshToken);
        if (result is null)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new { token = result.AccessToken });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
        }

        Response.Cookies.Delete("refreshToken");
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var success = await _authService.RegisterAsync(dto.Email, dto.Password, dto.Role, dto.FirstName, dto.LastName, dto.PhoneNumber);
        if (!success)
            return Conflict(new { message = "Email already registered or invalid role" });

        return Ok(new { message = "Registered. Awaiting approval." });
    }

    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }
}