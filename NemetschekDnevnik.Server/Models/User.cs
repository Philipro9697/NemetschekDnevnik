using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace NemetschekDnevnik.Server.Models;

public partial class User : IdentityUser<int>
{
    //public int UserId { get; set; }

    //public string Email { get; set; } = null!;

    //public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public bool IsApproved { get; set; }

    public virtual Admin? Admin { get; set; }

    public virtual Parent? Parent { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
