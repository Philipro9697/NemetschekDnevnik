using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class AuthService : IAuthService
{
    private readonly DnevnikContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(DnevnikContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResult?> LoginAsync(string email, string password)
    {
        email = email.Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash) || !user.IsApproved)
            return null;

        var accessToken = _tokenService.CreateAccessToken(user.UserId, user.Role);
        var refreshTokenString = _tokenService.CreateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            UserId = user.UserId
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenString
        };
    }

    public async Task<AuthResult?> RefreshAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
                                        .Include(t => t.User)
                                        .FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow || storedToken.IsRevoked)
        {
            return null;
        }

        var newAccessToken = _tokenService.CreateAccessToken(storedToken.UserId, storedToken.User.Role);
        var newRefreshTokenString = _tokenService.CreateRefreshToken();

        _context.RefreshTokens.Remove(storedToken);
        _context.RefreshTokens.Add(new RefreshToken
        {
            Token = newRefreshTokenString,
            UserId = storedToken.UserId,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        await _context.SaveChangesAsync();

        return new AuthResult { AccessToken = newAccessToken, RefreshToken = newRefreshTokenString };
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (storedToken == null) { return false; }

        _context.RefreshTokens.Remove(storedToken);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RegisterAsync(string email, string password, string role, string firstName, string lastName, string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(role) ||
            string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(phoneNumber))
        {
            return false;
        }

        if (await _context.Users.AnyAsync(u => u.Email == email))
            return false;

        using var transaction = await _context.Database.BeginTransactionAsync();

        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            IsApproved = false,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        switch (role)
        {
            case "Admin":
                _context.Admins.Add(new Admin { AdminId = user.UserId });
                break;
            case "Teacher":
                _context.Teachers.Add(new Teacher { TeacherId = user.UserId });
                break;
            case "Student":
                _context.Students.Add(new Student { StudentId = user.UserId });
                break;
            case "Parent":
                _context.Parents.Add(new Parent { ParentId = user.UserId });
                break;
            default:
                await transaction.RollbackAsync();
                return false;
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return true;
    }
}
