using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class GradeService : IGradeService
{
    private readonly DnevnikContext _db;
    public GradeService(DnevnikContext db)
    {
        _db = db;
    }

    public async Task<GradeDto?> AddGrade(int studentId, int teacherId, int subjectId, decimal value, string? comment)
    {
        var grade = new Grade
        {
            StudentId = studentId,
            TeacherId = teacherId,
            SubjectId = subjectId,
            GradeValue = value,
            Comment = comment,
            EntryDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        _db.Grades.Add(grade);
        await _db.SaveChangesAsync();

        return await LoadGradeDto(grade.GradeId);
    }

    public async Task<GradeDto?> UpdateGrade(int gradeId, decimal newValue, string? newComment)
    {
        var grade = await _db.Grades.FindAsync(gradeId);
        if (grade is null) return null;

        grade.GradeValue = newValue;
        grade.Comment = newComment;
        await _db.SaveChangesAsync();

        return await LoadGradeDto(gradeId);
    }

    public async Task<bool> DeleteGrade(int gradeId)
    {
        var grade = await _db.Grades.FindAsync(gradeId);
        if (grade is null) return false;

        _db.Grades.Remove(grade);
        await _db.SaveChangesAsync();
        return true;
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

    public async Task<List<GradeDto>> GetStudentGrades(int studentId)
    {
        return await _db.Grades
            .Where(g => g.StudentId == studentId)
            .OrderByDescending(g => g.EntryDate)
            .Select(g => new GradeDto
            {
                GradeId = g.GradeId,
                StudentId = g.StudentId ?? -1,
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
            .ToListAsync();
    }

    public async Task<List<GradeDto>> GetAllGrades()
    {
        return await _db.Grades
            .OrderByDescending(g => g.EntryDate)
            .Select(g => new GradeDto
            {
                GradeId = g.GradeId,
                StudentId = g.StudentId ?? -1,
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
            .ToListAsync();
    }
}
