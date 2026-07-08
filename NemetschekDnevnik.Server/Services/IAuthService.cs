namespace NemetschekDnevnik.Server.Services;

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string password);
}