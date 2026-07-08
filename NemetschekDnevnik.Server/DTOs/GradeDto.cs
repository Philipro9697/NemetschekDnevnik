using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class GradeDto
{
    [Required]
    public decimal GradeValue { get; set; }

    public string SubjectName { get; set; }

    public string TeacherFirstName { get; set; }

    public string TeacherLastName { get; set; }

    public string GradeTypeName { get; set; }

    public string? Comment { get; set; }

    public DateOnly EntryDate { get; set; }
}
