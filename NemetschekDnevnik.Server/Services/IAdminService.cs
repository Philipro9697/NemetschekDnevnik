using NemetschekDnevnik.Server.DTOs;

namespace NemetschekDnevnik.Server.Services;
public interface IAdminService
{
    Task<UserAccountDto?> GetUserProfileByIdAsync(int userId);
    Task<UserAccountDto?> ApproveAsync(int userId);
    Task<UserAccountDto?> BlockAsync(int userId);
    Task<bool> DeleteAsync(int userId);
    Task<IEnumerable<UserAccountDto>> GetPendingApprovalsAsync();
}