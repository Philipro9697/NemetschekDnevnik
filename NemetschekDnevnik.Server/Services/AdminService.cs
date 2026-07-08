using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;
public class AdminService : IAdminService
{
    private readonly NemetschekSchoolDiaryContext _db;
    public AdminService(NemetschekSchoolDiaryContext db)
    {
        _db = db;
    }

    public async Task<UserAccountDto?> GetUserProfileByIdAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        return new UserAccountDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            IsApproved = user.IsApproved
        };
    }

    public async Task<UserAccountDto?> ApproveAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = true;
        await _db.SaveChangesAsync();

        return new UserAccountDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            IsApproved = user.IsApproved
        };
    }

    public async Task<UserAccountDto?> BlockAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = false;
        await _db.SaveChangesAsync();

        return new UserAccountDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            IsApproved = user.IsApproved
        };
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
            .Select(u => new UserAccountDto
            {
                UserId = u.UserId,
                Email = u.Email,
                Role = u.Role,
                IsApproved = u.IsApproved
            })
            .ToListAsync();
    }
}