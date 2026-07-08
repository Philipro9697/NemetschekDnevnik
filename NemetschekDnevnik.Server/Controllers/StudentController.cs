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
    private readonly UserProfileService _profileService;
    public StudentController(StudentService studentservice, UserProfileService profileservice)
    {
        _studentService = studentservice;
        _profileService = profileservice;
    }
    [HttpGet("grades")]
    public async Task<ActionResult<List<GradeDto>>> GetGrades()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int studentId))
        {
            return Unauthorized("User ID not found in token.");
        }

        if (!User.IsInRole("Student"))
        {
            return Unauthorized("Wrong Role");
        }

        //User user = await _profileService.GetUserProfileByIdAsync(studentId);


    }
}

