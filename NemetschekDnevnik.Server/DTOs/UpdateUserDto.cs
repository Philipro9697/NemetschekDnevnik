namespace NemetschekDnevnik.Server.DTOs;


public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
   public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public string Role { get; set; } = string.Empty; // "Teacher", "Student", "Parent", "Admin"
    public string? Password { get; set; } // Optional password string

    public int? ClassId { get; set; }
    public int? ClassTeacherOfId { get; set; }
    public List<int>? SubjectIds { get; set; }
}