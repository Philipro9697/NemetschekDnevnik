using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Services;

namespace NemetschekDnevnik.Server.Controllers;

[ApiController]
[Route("api/admin/grades")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IGradeService _gradeService;
    public AdminController(IGradeService gradeService)
    {
        _gradeService = gradeService;
    }

    [HttpPost]
    public async Task<ActionResult<GradeDto>> AddGrade(AddGradeDto dto)
    {
        var grade = await _gradeService.AddGrade(dto.StudentId, dto.TeacherId, dto.SubjectId, dto.Value, dto.Comment);
        return Ok(grade);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GradeDto>> UpdateGrade(int id, UpdateGradeDto dto)
    {
        var grade = await _gradeService.UpdateGrade(id, dto.Value, dto.Comment);
        return grade is null ? NotFound() : Ok(grade);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGrade(int id)
    {
        var deleted = await _gradeService.DeleteGrade(id);
        return deleted ? Ok() : NotFound();
    }
}
