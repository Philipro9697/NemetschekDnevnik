using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;
public class AdminService : IAdminService
{
    private AccountProvisioningService _provisioningService;
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

    public async Task<UserAccountDto?> GetUserProfileByIdAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        return ToUserAccountDto(user);
    }

    public async Task<UserAccountDto?> CreateAsync(CreateUserDto dto)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = await _provisioningService.CreateAccountAsync(
            dto.Email, passwordHash,
            dto.Role, dto.FirstName,
            dto.LastName,
            dto.PhoneNumber,
            isApproved: false);
            
        if (user == null)
            return null;
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

    public async Task<IEnumerable<UserAccountDto>> GetPendingApprovalsAsync()
    {
        return await _db.Users
            .Where(u => !u.IsApproved)
            .Select(u => ToUserAccountDto(u))
            .ToListAsync();
    }
}