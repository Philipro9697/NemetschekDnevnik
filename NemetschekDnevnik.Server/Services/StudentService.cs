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
        return await _db.WeeklyScheduleItems
            .Where(ws => ws.ClassId == student.ClassId)
            .ToListAsync();
    }
    public async Task<List<GradeDto>> GetGrades(Student student)
    {

        return await _db.Grades.Where(g => g.StudentId == student.StudentId)
            .Select(g => new GradeDto
            {
                GradeValue = g.GradeValue,
                SubjectName = g.Subject.SubjectName,
                TeacherFirstName = g.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = g.Teacher.TeacherNavigation.LastName,
                GradeTypeName = g.GradeType.TypeName,
                Comment = g.Comment,
                EntryDate = g.EntryDate
            })
            .ToListAsync();
    }
    public async Task<List<Attendance>> GetAbsences(Student student)
    {
        return await _db.Attendances.Where(a => a.StudentId == student.StudentId).ToListAsync();
    }
    public async Task<List<Remark>> GetRemarks(Student student)
    {
        return await _db.Remarks.Where(r => r.StudentId == student.StudentId).ToListAsync();
    }
    public async Task<List<Lesson>> GetLessons(Student student)
    {
        return await _db.Lessons.Where(l => l.ClassId == student.ClassId).ToListAsync();
    }

    public async Task<List<Subject>> GetSubjects(Student student)
    {
        List<WeeklyScheduleItem> schedule = await GetWeeklySchedule(student);
        return await _db.Subjects
            .Where(s =>
                    schedule.Select(s => s.SubjectId)
                    .Contains(s.SubjectId)
                    )
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<HomeworkItem>> GetHomeworkItems(Student student)
    {
        return await _db.HomeworkItems.Where(hw => hw.ClassId == student.ClassId).ToListAsync();
    }
    public async Task<Student?> GetStudentById(int userId)
    {
        return await _db.Students.FirstOrDefaultAsync(u => u.StudentId == userId);
    }
}


