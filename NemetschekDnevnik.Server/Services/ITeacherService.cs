using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface ITeacherService
{
    Task<Teacher?> GetTeacher(int userId);
    Task<List<ClassDto>> GetClasses(Teacher teacher);
    Task<List<ScheduleDto>> GetWeeklySchedule(Teacher teacher);
    Task<List<SubjectDto>> GetSubjects(Teacher teacher);
    Task<List<RemarkDto>> GetRemarks(Teacher teacher);
    Task<List<LessonDto>> GetLessons(Teacher teacher);
    Task<List<AbsenceDto>> GetAbsences(Teacher teacher);
    Task<List<HomeworkItemDto>> GetHomeworkItems(Teacher teacher);
    Task<List<GradeDto>> GetGrades(Teacher teacher);
    Task<GradeDto> AddGrade(Teacher teacher, Student student, int subjectId, decimal value, string? comment);
    Task<GradeDto> LoadGradeDto(int gradeId);

    //GetMessages
    Task<GradeDto?> AddGrade(Teacher teacher, Student student, int subjectId, decimal value, string? comment);
}


