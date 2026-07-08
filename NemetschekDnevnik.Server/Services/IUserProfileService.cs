using NemetschekDnevnik.Server.DTOs;

namespace NemetschekDnevnik.Server.Services;
public interface IUserProfileService
{
    Task<UserProfileDto?> GetUserProfileByIdAsync(int userId);
    Task<UserProfileDto?> ApproveAsync(int userId);
    Task<UserProfileDto?> BlockAsync(int userId);
    Task<bool> DeleteAsync(int userId);
    Task<IEnumerable<UserProfileDto>> GetPendingApprovalsAsync();
}