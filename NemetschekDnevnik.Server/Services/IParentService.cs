using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface IParentService
{
    Task<List<Student>> GetChildren(Parent parent);
}


