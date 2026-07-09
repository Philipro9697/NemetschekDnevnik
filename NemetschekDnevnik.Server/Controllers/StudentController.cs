using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;
using NemetschekDnevnik.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/student")]
[Authorize]
public class StudentController : ControllerBase
{
    private readonly StudentService _studentService;
    public StudentController(StudentService studentservice)
    {
        _studentService = studentservice;
    }
    public async Task<Student?> GetStudent()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdString, out int studentId))
        {
            Student? student = await _studentService.GetStudentById(studentId);
            return student;
        }
        return null;
    }
    [HttpGet("grades")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<GradeDto>>> GetGrades()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetGrades(student));
    }

    [HttpGet("schedule")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<ScheduleDto>>> GetSchedule()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetWeeklySchedule(student));
    }

    [HttpGet("absences")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<AbsenceDto>>> GetAbsences()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetAbsences(student));
    }

    [HttpGet("remarks")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<RemarkDto>>> GetRemarks()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetRemarks(student));
    }

    [HttpGet("lessons")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<LessonDto>>> GetLessons()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetLessons(student));
    }

    [HttpGet("student_info")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentInfoDto>> GetStudentInfo()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(_studentService.GetStudentInfo(student));
    }

    [HttpGet("subjects")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetSubjects(student));
    }

    [HttpGet("homework")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<HomeworkItemDto>>> GetHomework()
    {
        Student? student = await GetStudent();
        if (student is null) return NotFound("User not found");
        return Ok(await _studentService.GetHomeworkItems(student));
    }
}


