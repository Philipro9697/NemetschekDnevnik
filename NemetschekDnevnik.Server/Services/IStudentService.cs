using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface IStudentService
{
    Task<List<ScheduleDto>> GetWeeklySchedule(Student student);
    Task<List<GradeDto>> GetGrades(Student student);
    Task<List<SubjectDto>> GetSubjects(Student student);
    Task<List<AbsenceDto>> GetAbsences(Student student);
    Task<List<RemarkDto>> GetRemarks(Student student);
    Task<List<LessonDto>> GetLessons(Student student);
    Task<List<HomeworkItem>> GetHomeworkItems(Student student);
    Task<Student?> GetStudentById(int userId);
    StudentInfoDto GetStudentInfo(Student student);
    //GetMessages
}


