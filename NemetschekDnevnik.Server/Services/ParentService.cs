using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class ParentService : IParentService
{
    private readonly DnevnikContext _db;
    public ParentService(DnevnikContext db)
    {
        _db = db;
    }
    public async Task<List<Student>> GetChildren(Parent parent)
    {
        return await _db.Students.Where(s => s.Parent == parent).ToListAsync();
    }
}


