using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public bool IsApproved { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Admin? Admin { get; set; }

    public virtual Parent? Parent { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
