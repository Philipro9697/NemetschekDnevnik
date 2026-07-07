using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;
public class UserProfileService : IUserProfileService
{
    private readonly NemetschekSchoolDiaryContext _db;
    public UserProfileService(NemetschekSchoolDiaryContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto?> GetUserProfileByIdAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        return new UserProfileDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            IsApproved = user.IsApproved
        };
    }

    public async Task<UserProfileDto?> ApproveAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = true;
        await _db.SaveChangesAsync();

        return new UserProfileDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            IsApproved = user.IsApproved
        };
    }

    public async Task<UserProfileDto?> BlockAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = false;
        await _db.SaveChangesAsync();

        return new UserProfileDto
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

    public async Task<IEnumerable<UserProfileDto>> GetPendingApprovalsAsync()
    {
        return await _db.Users
            .Where(u => !u.IsApproved)
            .Select(u => new UserProfileDto
            {
                UserId = u.UserId,
                Email = u.Email,
                Role = u.Role,
                IsApproved = u.IsApproved
            })
            .ToListAsync();
    }
}