using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Models;

public partial class Parent
{
    public int ParentId { get; set; }

    public virtual User ParentNavigation { get; set; } = null!;

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
