using System;
using System.Collections.Generic;


namespace NemetschekDnevnik.Server.Models;
public partial class Grade
{
    public int GradeId { get; set; }

    public string GradeValue { get; set; } = null!;

    public int? SubjectId { get; set; }

    public int? StudentId { get; set; }

    public int? TeacherId { get; set; }

    public DateOnly EntryDate { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Subject? Subject { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
