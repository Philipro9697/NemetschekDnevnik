
using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class ScheduleDto
{
    [Required]
    public int ScheduleId { get; set; }

    [Required]
    public int DayOfWeek { get; set; }

    [Required]
    public TimeOnly Time { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public int TeacherId { get; set; }

    [Required]
    public string TeacherFirstName { get; set; }

    [Required]
    public string TeacherLastName { get; set; }

    [Required]
    public string SubjectName { get; set; }

    public string? Location { get; set; }
}
