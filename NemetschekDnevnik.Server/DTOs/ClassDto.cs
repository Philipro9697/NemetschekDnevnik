namespace NemetschekDnevnik.Server.DTOs;
public partial class ClassDto
{
    public int ClassId { get; set; }
    public int ClassGrade { get; set; }
    public string ClassLetter { get; set; } = string.Empty;
    public int? HeadTeacherId { get; set; }
    public string HeadTeacherFirstName { get; set; } = string.Empty;
    public string HeadTeacherLastName { get; set; } = string.Empty;
}
