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
    public TeacherController(IStudentService studentservice, ITeacherService teacherservice)
    {
        _studentService = studentservice;
        _teacherService = teacherservice;
    }

    private async Task<Teacher?> GetTeacher()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdString, out int teacherId))
            return null;

        return await _teacherService.GetTeacher(teacherId);
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
        return Ok(await _teacherService.GetRemarks(teacher));
    }

    [HttpGet("lessons/{id}")]
    public async Task<ActionResult<List<LessonDto>>> GetLessons(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetLessons(teacher));
    }

    [HttpGet("absences/{id}")]
    public async Task<ActionResult<List<AbsenceDto>>> GetAbsences(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetAbsences(teacher));
    }

    [HttpGet("homework/{id}")]
    public async Task<ActionResult<List<HomeworkItemDto>>> GetHomework(int id)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        if (!teacher.Classes.Any(c => c.ClassId == id)) return Forbid("This is not your class!");
        return Ok(await _teacherService.GetHomeworkItems(teacher));
    }

    [HttpPost("grades")]
    public async Task<ActionResult<GradeDto>> AddGrade(GradeDto grade)
    {
        Teacher? teacher = await GetTeacher();
        if (teacher is null) return NotFound("User not found");
        GradeDto? addedgrade = await _teacherService.AddGrade(teacher, await _studentService.GetStudentById(grade.StudentId), grade.SubjectId, grade.GradeValue, grade.Comment);
        if (addedgrade is null) return Forbid("Failed adding grade (maybe you have no common classes with this student).");
        return Ok(addedgrade);
    }
}


