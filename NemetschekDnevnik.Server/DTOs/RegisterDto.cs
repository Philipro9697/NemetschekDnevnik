using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class RegisterDto : IValidatableObject
{
    private static readonly string[] AllowedRoles = new[] { "Teacher", "Student", "Parent" };

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string PhoneNumber { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!AllowedRoles.Contains(Role))
        {
            yield return new ValidationResult($"Role must be one of the following: {string.Join(", ", AllowedRoles)}", new[] { nameof(Role) });
            yield break;
        }

        if (string.IsNullOrEmpty(PhoneNumber))
        {
            yield return new ValidationResult("Phone number is required.", new[] { nameof(PhoneNumber) });
        }
    }
}