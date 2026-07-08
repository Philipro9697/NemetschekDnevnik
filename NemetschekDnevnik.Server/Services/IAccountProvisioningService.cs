using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface IAccountProvisioningService
{
    Task<User?> CreateAccountAsync(string email, string passwordHash, string role,
        string firstName, string lastName, string phoneNumber, bool isApproved);
}