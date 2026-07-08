using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class StudentService : IStudentService
{
    private readonly DnevnikContext _db;
    public StudentService(DnevnikContext db)
    {
        _db = db;
    }

    public async Task<List<WeeklyScheduleItem>> GetWeeklySchedule(Student student)
    {
        // TODO: student.Class instead of student.Classes
        return await _db.WeeklyScheduleItems
            .Where(ws => ws.Class == student.Class)
            .ToListAsync();
    }
    public async Task<List<Grade>> GetGrades(Student student)
    {
        return await _db.Grades.Where(g => g.Student == student).ToListAsync();
    }
    public async Task<List<Attendance>> GetAbsences(Student student)
    {
        return await _db.Attendances.Where(a => a.Student == student).ToListAsync();
    }
    public async Task<List<Remark>> GetRemarks(Student student)
    {
        return await _db.Remarks.Where(r => r.Student == student).ToListAsync();
    }
    public async Task<List<Lesson>> GetLessons(Student student)
    {
        return await _db.Lessons.Where(l => l.Class == student.Class).ToListAsync();
    }
}


