using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class AuthService : IAuthService
{
    private readonly NemetschekSchoolDiaryContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(NemetschekSchoolDiaryContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<string?> LoginAsync(string email, string password)
    {
        email = email.Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        if (!user.IsApproved)
            return null;

        return _tokenService.CreateToken(user.UserId, user.Role);
    }
}