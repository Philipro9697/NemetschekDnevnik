using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;
using NemetschekDnevnik.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/parent")]
[Authorize]
public class ParentController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IParentService _parentService;
    public ParentController(IStudentService studentservice, IParentService parentservice)
    {
        _studentService = studentservice;
        _parentService = parentservice;
    }
    public async Task<Parent?> GetParent()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdString, out int parentId))
        {
            Parent? parent = await _parentService.GetParentById(parentId);
            return parent;
        }
        return null;
    }
    
    [HttpGet("children")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<StudentInfoDto>>> GetChildren()
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        return Ok((await _parentService.GetChildren(parent))
            .Select(c => _studentService.GetStudentInfo(c))
            .ToList());
    }

    [HttpGet("grades/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<GradeDto>>> GetStudentGrades(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetGrades(student));
    }

    [HttpGet("absences/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<AbsenceDto>>> GetStudentAbsences(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetAbsences(student));
    }

    [HttpGet("remarks/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<RemarkDto>>> GetStudentRemarks(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetRemarks(student));
    }

    [HttpGet("subjects/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<SubjectDto>>> GetStudentSubjects(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetSubjects(student));
    }

    [HttpGet("schedule/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<ScheduleDto>>> GetStudentSchedule(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetWeeklySchedule(student));
    }

    [HttpGet("lessons/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<LessonDto>>> GetStudentLessons(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetLessons(student));
    }

    [HttpGet("homeworks/{id}")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<HomeworkItemDto>>> GetStudentHomeworks(int id)
    {
        Parent? parent = await GetParent();
        if (parent is null) return NotFound("Parent not found");
        Student? student = await _studentService.GetStudentById(id);
        if (student is null || student.ParentId != parent.ParentId)
        {
            return StatusCode(403, new { message = "This is not your child!" });
        }
        return Ok(await _studentService.GetHomeworkItems(student));
    }
}


