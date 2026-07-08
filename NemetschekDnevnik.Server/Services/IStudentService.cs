using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface IStudentService
{
    Task<List<WeeklyScheduleItem>> GetWeeklySchedule(Student student);
    Task<List<Grade>> GetGrades(Student student);
    Task<List<Subject>> GetSubjects(Student student);
    Task<List<Attendance>> GetAbsences(Student student);
    Task<List<Remark>> GetRemarks(Student student);
    Task<List<Lesson>> GetLessons(Student student);
    Task<List<HomeworkItem>> GetHomeworkItems(Student student);
    //GetMessages
}


