using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;
using NemetschekDnevnik.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/teacher")]
[Authorize]
public class TeacherController : ControllerBase
{
    private readonly StudentService _studentService;
    private readonly ParentService _parentService;
    public ParentController(StudentService studentservice, ParentService parentservice)
    {
        _studentService = studentservice;
        _parentService = parentservice;
    }
    public async Task<Parent> GetParent()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int parentId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        if (!User.IsInRole("Parent"))
        {
            throw new UnauthorizedAccessException("Wrong Role");
        }

        Parent? parent = await _parentService.GetParentById(parentId);

        if (parent is null)
        {
            throw new UnauthorizedAccessException("Parent not found");
        }

        return parent;

    }
    [HttpGet("children")]
    public async Task<ActionResult<List<StudentInfoDto>>> GetChildren()
    {
        try
        {
            Parent parent = await GetParent();
            return (await _parentService.GetChildren(parent))
                .Select(c => _studentService.GetStudentInfo(c))
                .ToList();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("grades/{id}")]
    public async Task<ActionResult<List<GradeDto>>> GetStudentGrades(int id)
    {
        try
        {
            Parent parent = await GetParent();
            Student? student = await _studentService.GetStudentById(id);
            if (student is null || student.ParentId != parent.ParentId)
            {
                throw new UnauthorizedAccessException("This is not your child!");
            }
            return await _studentService.GetGrades(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("absences/{id}")]
    public async Task<ActionResult<List<AbsenceDto>>> GetStudentAbsences(int id)
    {
        try
        {
            Parent parent = await GetParent();
            Student? student = await _studentService.GetStudentById(id);
            if (student is null || student.ParentId != parent.ParentId)
            {
                throw new UnauthorizedAccessException("This is not your child!");
            }
            return await _studentService.GetAbsences(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("remarks/{id}")]
    public async Task<ActionResult<List<RemarkDto>>> GetStudentRemarks(int id)
    {
        try
        {
            Parent parent = await GetParent();
            Student? student = await _studentService.GetStudentById(id);
            if (student is null || student.ParentId != parent.ParentId)
            {
                throw new UnauthorizedAccessException("This is not your child!");
            }
            return await _studentService.GetRemarks(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("subjects/{id}")]
    public async Task<ActionResult<List<SubjectDto>>> GetStudentSubjects(int id)
    {
        try
        {
            Parent parent = await GetParent();
            Student? student = await _studentService.GetStudentById(id);
            if (student is null || student.ParentId != parent.ParentId)
            {
                throw new UnauthorizedAccessException("This is not your child!");
            }
            return await _studentService.GetSubjects(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}


