using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Student
{
    public int StudentId { get; set; }

    public int? ParentId { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();

    public virtual Parent? Parent { get; set; }

    public virtual ICollection<Remark> Remarks { get; set; } = new List<Remark>();

    public virtual User StudentNavigation { get; set; } = null!;

    public virtual ICollection<SubmittedHomework> SubmittedHomeworks { get; set; } = new List<SubmittedHomework>();

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
}
