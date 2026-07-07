namespace NemetschekDnevnik.Server.Services;

public interface ITokenService
{
    string CreateToken(int userId, string roleName);
}