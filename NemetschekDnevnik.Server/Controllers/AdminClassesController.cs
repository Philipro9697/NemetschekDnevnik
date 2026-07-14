using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Data;
using NemetschekDnevnik.Server.Models; // Replace with your actual DbContext namespace

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/admin/classes")] // Maps perfectly to your frontend "/admin/classes"
[Authorize(Roles = "Admin")]
public class AdminClassesController : ControllerBase
{
    private readonly DnevnikContext _context; // Replace AppDbContext with your actual EF DbContext class name

    public AdminClassesController(DnevnikContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClassDto>>> GetClasses()
    {
        var classesList = await _context.Classes
            .Select(c => new ClassDto
            {
                ClassId = c.ClassId,
                ClassGrade = c.ClassGrade,
                // Using null-coalescing and defensive checks to prevent any 500 NullReferenceExceptions
                ClassLetter = c.ClassLetter ?? string.Empty,
                HeadTeacherId = c.HeadTeacherId,
                HeadTeacherFirstName = c.HeadTeacher != null ? c.HeadTeacher.TeacherNavigation.FirstName : string.Empty,
                HeadTeacherLastName = c.HeadTeacher != null ? c.HeadTeacher.TeacherNavigation.LastName : string.Empty
            })
            .ToListAsync();

        return Ok(classesList);
    }
}