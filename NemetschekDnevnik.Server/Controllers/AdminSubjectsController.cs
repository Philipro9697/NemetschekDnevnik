using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Data;
using NemetschekDnevnik.Server.Models; // Replace with your actual DbContext namespace

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/admin/subjects")] // Maps perfectly to your frontend "/admin/classes"
[Authorize(Roles = "Admin")]
public class AdminSubjectsController : ControllerBase
{
    private readonly DnevnikContext _db;

    public AdminSubjectsController(DnevnikContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
    {
        var subjects = await _db.Subjects
            .Select(s => new SubjectDto
            {
                SubjectId = s.SubjectId,
                SubjectName = s.SubjectName
            })
            .ToListAsync();

        return Ok(subjects);
    }
}