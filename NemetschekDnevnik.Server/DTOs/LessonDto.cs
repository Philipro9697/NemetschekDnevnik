
using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class LessonDto
{
    [Required]
    public int LessonId { get; set; }

    [Required]
    public DateOnly Date { get; set; }

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

    public int ScheduleItemId { get; set; }
}
