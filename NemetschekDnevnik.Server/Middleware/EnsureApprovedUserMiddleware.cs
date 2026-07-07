using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Models;
public class EnsureApprovedUserMiddleware
{
    private readonly RequestDelegate _next;
    
    public EnsureApprovedUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, NemetschekSchoolDiaryContext db)
    {
        if (context.Request.Path.StartsWithSegments("/api/auth", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        var userIdClaim = context.User.FindFirst("user_id")?.Value
            ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!int.TryParse(userIdClaim, out int userId))
        {
            await _next(context);
            return;
        }

        var user = await db.Users.FirstOrDefaultAsync( u => u.UserId == userId);

        if (user is not null && !user.IsApproved)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new
            {
                message = "User is pending approval to administrator."
            });
            return;
        }

        await _next(context);
    }
}