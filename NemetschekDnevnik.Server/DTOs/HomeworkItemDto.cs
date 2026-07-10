
using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class HomeworkItemDto
{
    [Required]
    public int HomeworkId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public int TeacherId { get; set; }

    [Required]
    public string Title { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public string ResourceLink { get; set; }

    [Required]
    public DateTime DateAssigned { get; set; }

    [Required]
    public DateTime DateDue { get; set; }
}
