using NemetschekDnevnik.Server.DTOs;

namespace NemetschekDnevnik.Server.Services;

public interface IGradeService
{
    Task<GradeDto?> AddGrade(int studentId, int teacherId, int subjectId, decimal value, string? comment);
    Task<GradeDto?> UpdateGrade(int gradeId, decimal newValue, string? newComment);
    Task<bool> DeleteGrade(int gradeId);
}
