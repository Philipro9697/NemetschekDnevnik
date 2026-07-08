using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class AccountProvisioningService : IAccountProvisioningService
{
    private static readonly string[] AllRoles = { "Admin", "Teacher", "Student", "Parent" };

    private readonly NemetschekSchoolDiaryContext _db;
    public AccountProvisioningService(NemetschekSchoolDiaryContext db) => _db = db;

    public async Task<User?> CreateAccountAsync(string email, string passwordHash, string role,
        string firstName, string lastName, string phoneNumber, bool isApproved)
    {
        if (!AllRoles.Contains(role))
            return null;

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return null;

        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            Email = email,
            PasswordHash = passwordHash,
            Role = role,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
            IsApproved = isApproved
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        switch (role)
        {
            case "Admin":
                _db.Admins.Add(new Admin { AdminId = user.UserId });
                break;
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
        return user;
    }
}