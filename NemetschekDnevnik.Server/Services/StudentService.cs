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

    public async Task<List<ScheduleDto>> GetWeeklySchedule(Student student)
    {
        return await _db.WeeklyScheduleItems
            .Where(ws => ws.ClassId == student.ClassId)
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
    public async Task<List<GradeDto>> GetGrades(Student student)
    {

        return await _db.Grades.Where(g => g.StudentId == student.StudentId)
            .Select(g => new GradeDto
            {
                GradeValue = g.GradeValue,
                GradeId = g.GradeId,
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
    public async Task<List<AbsenceDto>> GetAbsences(Student student)
    {
        return await _db.Attendances.Where(a => a.StudentId == student.StudentId && a.IsAbsent)
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
    public async Task<List<RemarkDto>> GetRemarks(Student student)
    {
        return await _db.Remarks.Where(r => r.StudentId == student.StudentId)
            .Select(r => new RemarkDto
            {
                RemarkId = r.RemarkId,
                TeacherId = r.TeacherId ?? -1,
                DateCreated = r.DateCreated,
                Type = r.Type,
                Text = r.Text,
                TeacherFirstName = r.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = r.Teacher.TeacherNavigation.LastName
            })
            .ToListAsync();
    }
    public async Task<List<LessonDto>> GetLessons(Student student)
    {
        return await _db.Lessons.Where(l => l.ClassId == student.ClassId)
            .Select(s => new LessonDto
            {
                LessonId = s.LessonId,
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

    public async Task<List<SubjectDto>> GetSubjects(Student student)
    {
        List<ScheduleDto> schedule = await GetWeeklySchedule(student);
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

    public async Task<List<HomeworkItemDto>> GetHomeworkItems(Student student)
    {
        return await _db.HomeworkItems.Where(hw => hw.ClassId == student.ClassId)
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

    public async Task<Student?> GetStudentById(int userId)
    {
        return await _db.Students.FirstOrDefaultAsync(u => u.StudentId == userId);
    }

    public StudentInfoDto GetStudentInfo(Student student)
    {
        return new StudentInfoDto
        {
            StudentId = student.StudentId,
            ParentId = student.ParentId ?? -1,
            ClassId = student.ClassId ?? -1,
            FirstName = student.StudentNavigation.FirstName,
            LastName = student.StudentNavigation.LastName,
            Email = student.StudentNavigation.Email,
            PhoneNumber = student.StudentNavigation.PhoneNumber
        };

    }
}


