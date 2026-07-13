
using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class AbsenceDto
{
    [Required]
    public bool IsExcused { get; set; }

    public DateOnly? Date { get; set; }

    public TimeOnly? Time { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public string SubjectName { get; set; }

    [Required]
    public int LessonId { get; set; }
}
