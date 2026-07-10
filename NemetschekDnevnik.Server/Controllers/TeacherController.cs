using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;
using NemetschekDnevnik.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/teacher")]
[Authorize(Roles = "Teacher")]
public class TeacherController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly ITeacherService _teacherService;
    private readonly IGradeService _gradeService;
    public TeacherController(IStudentService studentservice, ITeacherService teacherservice, IGradeService gradeservice)
    {
        _studentService = studentservice;
        _teacherService = teacherservice;
        _gradeService = gradeservice;
    }

    private async Task<Teacher?> GetTeacher()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdString, out int teacherId))
            return null;

        return await _teacherService.GetTeacher(teacherId);
    }

    [HttpPost("grades")]
    public async Task<ActionResult<GradeDto>> AddGrade(AddGradeDto dto)
    {
        var teacher = await GetTeacher();
        if (teacher is null) return Unauthorized();

        var student = await _studentService.GetStudentById(dto.StudentId);
        if (student is null) return NotFound();

        if (!await _teacherService.TeachesStudent(teacher, student))
            return Forbid();

        var grade = await _gradeService.AddGrade(dto.StudentId, teacher.TeacherId, dto.SubjectId, dto.Value, dto.Comment);
        return Ok(grade);
    }

    [HttpGet("grades/{id}")]
    public async Task<ActionResult<List<GradeDto>>> GetGrades(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");

        return Ok(await _teacherService.GetGrades(teacher, id));
    }

    [HttpGet("classes")]
    public async Task<ActionResult<List<ClassDto>>> GetClasses()
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        return Ok(await _teacherService.GetClasses(teacher));
    }

    [HttpGet("class")]
    public async Task<ActionResult<ClassDto?>> GetClass()
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        return Ok(await _teacherService.GetClass(teacher));
    }

    [HttpGet("schedule")]
    public async Task<ActionResult<List<ScheduleDto>>> GetSchedule()
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        return Ok(await _teacherService.GetWeeklySchedule(teacher));
    }

    [HttpGet("subjects")]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        return Ok(await _teacherService.GetSubjects(teacher));
    }
    //TODO: add class filter for these GETs
    [HttpGet("remarks/{id}")]
    public async Task<ActionResult<List<RemarkDto>>> GetRemarks(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetRemarks(teacher, id));
    }

    [HttpGet("lessons/{id}")]
    public async Task<ActionResult<List<LessonDto>>> GetLessons(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetLessons(teacher, id));
    }

    [HttpGet("absences/{id}")]
    public async Task<ActionResult<List<AbsenceDto>>> GetAbsences(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetAbsences(teacher, id));
    }

    [HttpGet("homework/{id}")]
    public async Task<ActionResult<List<HomeworkItemDto>>> GetHomework(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetHomeworkItems(teacher, id));
    }
}


