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
    public async Task<Student> GetStudent()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int studentId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        if (!User.IsInRole("Student"))
        {
            throw new UnauthorizedAccessException("Wrong Role");
        }

        Student? student = await _studentService.GetStudentById(studentId);

        if (student is null)
        {
            throw new UnauthorizedAccessException("Student not found");
        }

        return student;

    }
    [HttpGet("grades")]
    public async Task<ActionResult<List<GradeDto>>> GetGrades()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetGrades(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("schedule")]
    public async Task<ActionResult<List<ScheduleDto>>> GetSchedule()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetWeeklySchedule(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("absences")]
    public async Task<ActionResult<List<AbsenceDto>>> GetAbsences()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetAbsences(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("remarks")]
    public async Task<ActionResult<List<RemarkDto>>> GetRemarks()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetRemarks(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("lessons")]
    public async Task<ActionResult<List<LessonDto>>> GetLessons()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetLessons(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("student_info")]
    public async Task<ActionResult<StudentInfoDto>> GetStudentInfo()
    {
        try
        {
            Student student = await GetStudent();
            return _studentService.GetStudentInfo(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("subjects")]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetSubjects(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("homework")]
    public async Task<ActionResult<List<HomeworkItemDto>>> GetHomework()
    {
        try
        {
            Student student = await GetStudent();
            return await _studentService.GetHomeworkItems(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}


