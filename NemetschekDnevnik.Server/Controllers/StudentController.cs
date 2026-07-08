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
}

