namespace NemetschekDnevnik.Server.DTOs;
public class TeacherDto
{
    public int TeacherId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public List<string> SubjectNames { get; set; } = new();
}