namespace NemetschekDnevnik.Server.Services;

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string password);
    Task<bool> RegisterAsync(string email, string password, string role, string firstName, string lastName);
}