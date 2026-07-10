using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class UpdateGradeDto
{
    [Required]
    public decimal Value { get; set; }

    public string? Comment { get; set; }
}
