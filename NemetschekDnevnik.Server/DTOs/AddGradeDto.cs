using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class AddGradeDto
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    public int TeacherId { get; set; }

    [Required]
    public decimal Value { get; set; }

    public string? Comment { get; set; }
}
