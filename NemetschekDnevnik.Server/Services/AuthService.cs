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

    public async Task<bool> RegisterAsync(string email, string password, string role, string firstName, string lastName, string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(email) ||
        string.IsNullOrWhiteSpace(password) ||
        string.IsNullOrWhiteSpace(role) ||
        string.IsNullOrWhiteSpace(firstName) ||
        string.IsNullOrWhiteSpace(lastName) ||
        string.IsNullOrWhiteSpace(phoneNumber))
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
            IsApproved = false
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