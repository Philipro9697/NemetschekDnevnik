using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class AdminService : IAdminService
{
    private static readonly string[] CreatableRoles = { "Teacher", "Student", "Parent" };

    private readonly NemetschekSchoolDiaryContext _db;
    public AdminService(NemetschekSchoolDiaryContext db)
    {
        _db = db;
    }

    private static UserAccountDto ToUserAccountDto(User user) => new()
    {
        UserId = user.UserId,
        Email = user.Email,
        Role = user.Role,
        FirstName = user.FirstName,
        LastName = user.LastName,
        PhoneNumber = user.PhoneNumber,
        IsApproved = user.IsApproved
    };

    public async Task<UserAccountDto?> GetUserProfileAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        return ToUserAccountDto(user);
    }

    public async Task<UserAccountDto?> CreateAsync(CreateUserDto dto)
    {
        if (!CreatableRoles.Contains(dto.Role))
            return null;

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return null;

        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            IsApproved = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        switch (dto.Role)
        {
            case "Teacher":
                _db.Teachers.Add(new Teacher { TeacherId = user.UserId });
                break;
            case "Student":
                _db.Students.Add(new Student { StudentId = user.UserId });
                break;
            case "Parent":
                _db.Parents.Add(new Parent { ParentId = user.UserId });
                break;
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return ToUserAccountDto(user);
    }

    public async Task<UserAccountDto?> ApproveAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = true;
        await _db.SaveChangesAsync();

        return ToUserAccountDto(user);
    }

    public async Task<UserAccountDto?> BlockAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = false;
        await _db.SaveChangesAsync();

        return ToUserAccountDto(user);
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return false;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<UserAccountDto>> GetAllUsersAsync()
    {
        var users = await _db.Users.ToListAsync();
        return users.Select(ToUserAccountDto);
    }
}
