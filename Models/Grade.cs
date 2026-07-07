using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Models;

public partial class Grade
{
    public int GradeId { get; set; }

    public decimal GradeValue { get; set; }

    public int? SubjectId { get; set; }

    public int? StudentId { get; set; }

    public int? TeacherId { get; set; }

    public int? GradeTypeId { get; set; }

    public string? Comment { get; set; }

    public DateOnly EntryDate { get; set; }

    public virtual GradeType? GradeType { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Subject? Subject { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
