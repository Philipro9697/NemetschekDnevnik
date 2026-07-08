using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;
public partial class GradeType
{
    public int GradeTypeId { get; set; }

    public string TypeName { get; set; } = null!;

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();
}
