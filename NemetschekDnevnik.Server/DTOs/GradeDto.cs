using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class GradeDto
{
    [Required]
    public decimal GradeValue { get; set; }

    [Required]
    public int GradeId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public int TeacherId { get; set; }

    [Required]
    public string SubjectName { get; set; }

    [Required]
    public string TeacherFirstName { get; set; }

    [Required]
    public string TeacherLastName { get; set; }

    [Required]
    public string GradeTypeName { get; set; }

    public string? Comment { get; set; }

    public DateOnly EntryDate { get; set; }
}
