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
    private readonly IParentService _parentService;
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
    public async Task<ActionResult<List<GradeDto>>> GetStudentGrades(int id)
    {
        var teacher = await GetTeacher();
        if (teacher is null) return Unauthorized();

        var student = await _studentService.GetStudentById(id);
        if (student is null) return NotFound();

        if (!await _teacherService.TeachesStudent(teacher, student))
            return Forbid();

        return await _studentService.GetGrades(student);
    }

    [HttpGet("absences/{id}")]
    public async Task<ActionResult<List<AbsenceDto>>> GetStudentAbsences(int id)
    {
        var teacher = await GetTeacher();
        if (teacher is null) return Unauthorized();

        var student = await _studentService.GetStudentById(id);
        if (student is null) return NotFound();

        if (!await _teacherService.TeachesStudent(teacher, student))
            return Forbid();

        return await _studentService.GetAbsences(student);
    }

    [HttpGet("remarks/{id}")]
    public async Task<ActionResult<List<RemarkDto>>> GetStudentRemarks(int id)
    {
        var teacher = await GetTeacher();
        if (teacher is null) return Unauthorized();

        var student = await _studentService.GetStudentById(id);
        if (student is null) return NotFound();

        if (!await _teacherService.TeachesStudent(teacher, student))
            return Forbid();

        return await _studentService.GetRemarks(student);
    }

    [HttpGet("subjects/{id}")]
    public async Task<ActionResult<List<SubjectDto>>> GetStudentSubjects(int id)
    {
        var teacher = await GetTeacher();
        if (teacher is null) return Unauthorized();

        var student = await _studentService.GetStudentById(id);
        if (student is null) return NotFound();

        if (!await _teacherService.TeachesStudent(teacher, student))
            return Forbid();

        return await _studentService.GetSubjects(student);
    }
}


