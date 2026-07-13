using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public interface ITeacherService
{
    Task<Teacher?> GetTeacher(int userId);
    Task<List<ClassDto>> GetClasses(Teacher teacher);
    Task<ClassDto?> GetClass(Teacher teacher);
    Task<List<ScheduleDto>> GetWeeklySchedule(Teacher teacher);
    Task<List<SubjectDto>> GetSubjects(Teacher teacher);
    Task<List<RemarkDto>> GetRemarks(Teacher teacher, int classId);
    Task<List<RemarkDto>> GetRemarksForStudent(Teacher teacher, int studentId);
    Task<List<LessonDto>> GetLessons(Teacher teacher, int classId);
    Task<List<AbsenceDto>> GetAbsences(Teacher teacher, int classId);
    Task<List<HomeworkItemDto>> GetHomeworkItems(Teacher teacher, int classId);
    Task<List<GradeDto>> GetGrades(Teacher teacher, int classId);
    bool TeachesStudent(Teacher teacher, Student student);

    //GetMessages
}


