
using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class SubjectDto
{
    [Required]
    public int SubjectId { get; set; }

    [Required]
    public string SubjectName { get; set; }
}
