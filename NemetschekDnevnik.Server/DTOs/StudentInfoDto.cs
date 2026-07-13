using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class StudentInfoDto
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public int ParentId { get; set; }

    [Required]
    public int ClassId { get; set; }

    public int ClassGrade { get; set; }

    public string ClassLetter { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; }

    [Required]
    public string LastName { get; set; }

    [Required]
    public string Email { get; set; }

    [Required]
    public string PhoneNumber { get; set; }
}
