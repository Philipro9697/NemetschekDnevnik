namespace NemetschekDnevnik.Server.Services;

public interface ITokenService
{
    string CreateAccessToken(int userId, string roleName);
    string CreateRefreshToken();
}