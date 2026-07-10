using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.Models;
public partial class User : ISoftDelete
{
    public int UserId { get; set; }

    [Required]
    [EmailAddress] 
    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public bool IsApproved { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    public virtual Admin? Admin { get; set; }

    public virtual Parent? Parent { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
