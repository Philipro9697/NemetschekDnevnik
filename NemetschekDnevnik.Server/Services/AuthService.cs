using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class AuthService : IAuthService
{
    private readonly NemetschekSchoolDiaryContext _context;
    private readonly ITokenService _tokenService;
    private AccountProvisioningService _provisioningService;

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

    public async Task<bool> RegisterAsync(string email, string password, string role, string firstName, string lastName, string phoneNumber)
{
    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) ||
        string.IsNullOrWhiteSpace(role) || string.IsNullOrWhiteSpace(firstName) ||
        string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(phoneNumber))
    {
        return false;
    }

    var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
    var user = await _provisioningService.CreateAccountAsync(email, passwordHash, role, firstName, lastName, phoneNumber, isApproved: false);
    return user is not null;
}
}