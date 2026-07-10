using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class RemarkDto
{
    [Required]
    public int RemarkId { get; set; }

    [Required]
    public int TeacherId { get; set; }

    [Required]
    public DateTime DateCreated { get; set; }

    [Required]
    public string Type { get; set; }

    [Required]
    public string Text { get; set; }

    [Required]
    public string TeacherFirstName { get; set; }

    [Required]
    public string TeacherLastName { get; set; }
}
