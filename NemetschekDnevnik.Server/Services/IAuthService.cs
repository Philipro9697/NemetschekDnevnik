namespace NemetschekDnevnik.Server.Services;

public interface IAuthService
{
    Task<AuthResult?> LoginAsync(string email, string password);
    Task<bool> RegisterAsync(string email, string password, string role, string firstName, string lastName, string phoneNumber);
    Task<AuthResult?> RefreshAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
}
