using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class TeacherService : ITeacherService
{
    private readonly DnevnikContext _db;
    public TeacherService(DnevnikContext db)
    {
        _db = db;
    }

    public async Task<Teacher?> GetTeacher(int userId)
    {
        return await _db.Teachers.FirstOrDefaultAsync(u => u.TeacherId == userId);
    }

    public async Task<List<ScheduleDto>> GetWeeklySchedule(Teacher teacher)
    {
        return await _db.WeeklyScheduleItems
            .Where(ws => ws.TeacherId == teacher.TeacherId)
            .Select(ws => new ScheduleDto
            {
                ScheduleId = ws.ScheduleItemId,
                DayOfWeek = ws.DayOfWeek,
                Time = ws.Time,
                SubjectId = ws.SubjectId ?? -1,
                TeacherId = ws.TeacherId ?? -1,
                TeacherFirstName = ws.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = ws.Teacher.TeacherNavigation.LastName,
                SubjectName = ws.Subject.SubjectName,
                Location = ws.Location
            })
            .ToListAsync();
    }

    public async Task<List<AbsenceDto>> GetAbsences(Teacher teacher)
    {
        return await _db.Attendances.Where(a => a.Lesson.TeacherId == teacher.TeacherId && a.IsAbsent)
            .Select(a => new AbsenceDto
            {
                IsExcused = a.IsExcused,
                Date = a.Lesson.Date,
                Time = a.Lesson.Time,
                SubjectId = a.Lesson.SubjectId ?? -1,
                SubjectName = a.Lesson.Subject.SubjectName,
                LessonId = a.LessonId
            })
            .ToListAsync();
    }
    public async Task<List<RemarkDto>> GetRemarks(Teacher teacher)
    {
        return await _db.Remarks.Where(r => r.TeacherId == teacher.TeacherId)
            .Select(r => new RemarkDto
            {
                TeacherId = r.TeacherId ?? -1,
                DateCreated = r.DateCreated,
                Type = r.Type,
                Text = r.Text,
                TeacherFirstName = r.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = r.Teacher.TeacherNavigation.LastName
            })
            .ToListAsync();
    }

    public async Task<List<ClassDto>> GetClasses(Teacher teacher)
    {
        return await _db.Classes
            .Where(c => c.HeadTeacherId == teacher.TeacherId)
            .Select(c => new ClassDto
            {
                ClassId = c.ClassId,
                ClassGrade = c.ClassGrade,
                ClassLetter = c.ClassLetter,
                HeadTeacherId = c.HeadTeacherId,
                HeadTeacherFirstName = c.HeadTeacherId.HasValue ? c.HeadTeacher.TeacherNavigation.FirstName : string.Empty,
                HeadTeacherLastName = c.HeadTeacherId.HasValue ? c.HeadTeacher.TeacherNavigation.LastName : string.Empty
            })
            .ToListAsync();
    }
    public async Task<List<LessonDto>> GetLessons(Teacher teacher)
    {
        return await _db.Lessons.Where(l => l.TeacherId == teacher.TeacherId)
            .Select(s => new LessonDto
            {
                Date = s.Date,
                Time = s.Time,
                SubjectId = s.SubjectId ?? -1,
                TeacherId = s.TeacherId ?? -1,
                TeacherFirstName = s.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = s.Teacher.TeacherNavigation.LastName,
                SubjectName = s.Subject.SubjectName,
                ScheduleItemId = s.ScheduleItemId ?? -1
            })
            .ToListAsync();
    }

    public async Task<List<SubjectDto>> GetSubjects(Teacher teacher)
    {
        List<ScheduleDto> schedule = await GetWeeklySchedule(teacher);
        return await _db.Subjects
            .Where(s =>
                    schedule.Select(s => s.SubjectId)
                    .Contains(s.SubjectId)
                    )
            .Distinct()
            .Select(s => new SubjectDto
            {
                SubjectId = s.SubjectId,
                SubjectName = s.SubjectName
            })
            .ToListAsync();
    }

    public async Task<List<HomeworkItemDto>> GetHomeworkItems(Teacher teacher)
    {
        return await _db.HomeworkItems.Where(hw => hw.TeacherId == teacher.TeacherId)
            .Select(hw => new HomeworkItemDto
            {
                HomeworkId = hw.HomeworkId,
                SubjectId = hw.SubjectId ?? -1,
                TeacherId = hw.TeacherId ?? -1,
                Title = hw.Title,
                Description = hw.Description ?? "",
                ResourceLink = hw.ResourceLink ?? "",
                DateAssigned = hw.DateAssigned,
                DateDue = hw.DateDue
            })
            .ToListAsync();
    }

    public async Task<List<GradeDto>> GetGrades(Teacher teacher, int classId)
    {

        return await _db.Grades.Where(g => g.TeacherId == teacher.TeacherId && g.Student.ClassId == classId)
            .Select(g => new GradeDto
            {
                GradeValue = g.GradeValue,
                StudentId = g.StudentId ?? -1,
                SubjectId = g.SubjectId ?? -1,
                TeacherId = g.TeacherId ?? -1,
                SubjectName = g.Subject.SubjectName,
                TeacherFirstName = g.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = g.Teacher.TeacherNavigation.LastName,
                GradeTypeName = g.GradeType.TypeName,
                Comment = g.Comment,
                EntryDate = g.EntryDate
            })
            .ToListAsync();
    }
    private bool TeachesStudent(Teacher teacher, Student student)
    {
        return teacher.Classes.Any(c => c.ClassId == student.Class.ClassId);
    }
    public async Task<GradeDto?> AddGrade(Teacher teacher, Student student, int subjectId, decimal value, string? comment)
    {
        if (!TeachesStudent(teacher, student)) return null;

        var grade = new Grade()
        {
            StudentId = student.StudentId,
            TeacherId = teacher.TeacherId,
            SubjectId = subjectId,
            GradeValue = value,
            Comment = comment,
            EntryDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        _db.Grades.Add(grade);
        await _db.SaveChangesAsync();

        return await LoadGradeDto(grade.GradeId);
    }

    private async Task<GradeDto?> LoadGradeDto(int gradeId)
    {
        return await _db.Grades.Where(g => g.GradeId == gradeId)
            .Select(g => new GradeDto
            {
                GradeId = g.GradeId,
                GradeValue = g.GradeValue,
                SubjectId = g.SubjectId ?? -1,
                TeacherId = g.TeacherId ?? -1,
                SubjectName = g.Subject!.SubjectName,
                TeacherFirstName = g.Teacher!.TeacherNavigation.FirstName,
                TeacherLastName = g.Teacher!.TeacherNavigation.LastName,
                GradeTypeName = g.GradeType != null ? g.GradeType.TypeName : string.Empty,
                Comment = g.Comment,
                EntryDate = g.EntryDate
            })
            .FirstOrDefaultAsync();
    }
}


