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
        return await _db.Students
            .Include(s => s.StudentNavigation)
            .Include(s => s.Class)
            .Where(s => s.Parent == parent)
            .ToListAsync();
    }
    public async Task<Parent?> GetParentById(int parentId)
    {
        return await _db.Parents.FirstOrDefaultAsync(p => p.ParentId == parentId);
    }
}


