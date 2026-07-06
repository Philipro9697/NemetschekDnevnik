using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Parent
{
    public int ParentId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public virtual User ParentNavigation { get; set; } = null!;

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
