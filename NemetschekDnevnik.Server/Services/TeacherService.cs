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
        return await _db.Teachers.Include(t => t.Classes).FirstOrDefaultAsync(u => u.TeacherId == userId);
    }

    public async Task<ClassDto?> GetClass(Teacher teacher)
    {
        Class? _class = await _db.Classes.FirstOrDefaultAsync(c => c.HeadTeacherId == teacher.TeacherId);
        if (_class is null) return null;
        return new ClassDto
        {
            ClassId = _class.ClassId,
            ClassGrade = _class.ClassGrade,
            ClassLetter = _class.ClassLetter,
            HeadTeacherId = _class.HeadTeacherId,
            HeadTeacherFirstName = teacher.TeacherNavigation.FirstName,
            HeadTeacherLastName = teacher.TeacherNavigation.LastName
        };
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

    public async Task<List<StudentInfoDto>> GetStudents(int classId)
    {
        return await _db.Students
            .Where(s => s.ClassId == classId)
            .Select(s => new StudentInfoDto
            {
                StudentId = s.StudentId,
                ParentId = s.ParentId ?? -1,
                ClassId = s.ClassId ?? -1,

                // Pull class context safely
                ClassGrade = s.Class != null ? s.Class.ClassGrade : 0,
                ClassLetter = s.Class != null ? s.Class.ClassLetter : "",

                // Pull profile data via StudentNavigation object 
                FirstName = s.StudentNavigation.FirstName,
                LastName = s.StudentNavigation.LastName,
                Email = s.StudentNavigation.Email,
                PhoneNumber = s.StudentNavigation.PhoneNumber
            })
            .ToListAsync();
    }

    public async Task<List<AbsenceDto>> GetAbsences(Teacher teacher, int classId)
    {
        return await _db.Attendances.Where(a => a.Lesson.TeacherId == teacher.TeacherId && a.IsAbsent && a.Lesson.ClassId == classId)
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
    public async Task<List<RemarkDto>> GetRemarks(Teacher teacher, int classId)
    {
        return await _db.Remarks.Where(r => r.TeacherId == teacher.TeacherId && r.Student.ClassId == classId)
            .Select(r => new RemarkDto
            {
                RemarkId = r.RemarkId,
                StudentId = r.StudentId ?? -1,
                TeacherId = r.TeacherId ?? -1,
                DateCreated = r.DateCreated,
                Type = r.Type,
                Text = r.Text,
                TeacherFirstName = r.Teacher.TeacherNavigation.FirstName,
                TeacherLastName = r.Teacher.TeacherNavigation.LastName
            })
            .ToListAsync();
    }

    public async Task<List<RemarkDto>> GetRemarksForStudent(Teacher teacher, int studentId)
    {
        return await _db.Remarks.Where(r => r.TeacherId == teacher.TeacherId && r.StudentId == studentId)
            .Select(r => new RemarkDto
            {
                RemarkId = r.RemarkId,
                StudentId = r.StudentId ?? -1,
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
    public async Task<List<LessonDto>> GetLessons(Teacher teacher, int classId)
    {
        return await _db.Lessons.Where(l => l.TeacherId == teacher.TeacherId && l.ClassId == classId)
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

    public async Task<List<HomeworkItemDto>> GetHomeworkItems(Teacher teacher, int classId)
    {
        return await _db.HomeworkItems.Where(hw => hw.TeacherId == teacher.TeacherId && hw.ClassId == classId)
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
                GradeId = g.GradeId,
                GradeValue = g.GradeValue,
                StudentId = g.StudentId ?? -1,
                StudentFirstName = g.Student.StudentNavigation.FirstName,
                StudentLastName = g.Student.StudentNavigation.LastName,
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
    
    public bool TeachesStudent(Teacher teacher, Student student)
    {
        return teacher.Classes.Any(c => c.ClassId == student.Class.ClassId);
    }
    
}


