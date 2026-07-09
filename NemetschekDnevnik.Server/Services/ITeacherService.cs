using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface ITeacherService
{
    Task<List<ClassDto>> GetClasses(Teacher teacher);
    Task<List<ScheduleDto>> GetSchedule(Teacher teacher);
    Task<List<SubjectDto>> GetSubjects(Teacher teacher);
    Task<List<LessonDto>> GetLessons(Teacher teacher);
    Task<Student?> GetTeacher(int userId);
    //GetMessages
    Task<GradeDto?> AddGrade(Teacher teacher, Student student, int subjectId, decimal value, string? comment);
    Task<GradeDto?> UpdateGrade(int gradeId, decimal newValue, string? newComment);
    Task<bool> DeleteGrade(int gradeId);
}


